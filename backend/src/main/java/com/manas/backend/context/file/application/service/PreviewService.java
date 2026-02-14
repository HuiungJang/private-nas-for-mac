package com.manas.backend.context.file.application.service;

import com.manas.backend.common.exception.FileOperationException;
import com.manas.backend.context.file.application.port.in.GetFilePreviewUseCase;
import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.file.application.port.out.PreviewGeneratorPort;
import com.manas.backend.context.file.domain.FileContent;
import com.manas.backend.context.file.domain.PreviewType;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class PreviewService implements GetFilePreviewUseCase {

    private final FileStoragePort fileStoragePort;
    private final PreviewGeneratorPort previewGeneratorPort;
    private final Path cacheDir;
    private final Counter cacheHitCounter;
    private final Counter cacheMissCounter;

    public PreviewService(
            FileStoragePort fileStoragePort,
            PreviewGeneratorPort previewGeneratorPort,
            MeterRegistry meterRegistry,
            @Value("${app.storage.cache-dir}") String cacheDirString
    ) {
        this.fileStoragePort = fileStoragePort;
        this.previewGeneratorPort = previewGeneratorPort;
        this.cacheDir = Paths.get(cacheDirString).toAbsolutePath().normalize();
        this.cacheHitCounter = meterRegistry.counter("app.preview.cache.hit");
        this.cacheMissCounter = meterRegistry.counter("app.preview.cache.miss");
        initializeCacheDir();
    }

    private void initializeCacheDir() {
        try {
            if (!Files.exists(cacheDir)) {
                Files.createDirectories(cacheDir);
            }
        } catch (IOException e) {
            throw new FileOperationException("Failed to initialize cache directory: " + cacheDir, e);
        }
    }

    @Override
    public FileContent getPreview(String path, UUID userId) {
        // 1. Check Cache
        String cacheKey = generateCacheKey(path);
        Path cachedFile = cacheDir.resolve(cacheKey + ".jpg");

        if (Files.exists(cachedFile)) {
            try {
                log.debug("Cache hit for preview: {}", path);
                cacheHitCounter.increment();
                return new FileContent(
                        "thumbnail.jpg",
                        "image/jpeg",
                        Files.size(cachedFile),
                        Files.newInputStream(cachedFile)
                );
            } catch (IOException e) {
                log.error("Failed to read cached preview", e);
                // Fallback to regeneration
            }
        }

        // 2. Retrieve Original
        cacheMissCounter.increment();
        log.info("Generating preview for: {}", path);
        FileContent source = fileStoragePort.retrieve(path, userId);

        // 3. Generate Preview
        if (previewGeneratorPort.supports(source.contentType())) {
            FileContent preview = previewGeneratorPort.generate(source, PreviewType.THUMBNAIL);

            if (preview != null) {
                // 4. Save to Cache
                saveToCache(cachedFile, preview);

                // 5. Return from Cache (fresh stream)
                try {
                    return new FileContent(
                            "thumbnail.jpg",
                            "image/jpeg",
                            Files.size(cachedFile),
                            Files.newInputStream(cachedFile)
                    );
                } catch (IOException e) {
                    log.error("Failed to open cached preview after save", e);
                }
            }
        }

        // Fallback: If not supported or generation failed, return original if small, or null?
        // For now, if it's an image but generation failed, return original.
        // If it's a PDF/Video and we don't support it yet, maybe return a placeholder?
        // The Controller will handle null by returning 404 or a default asset.
        // But for "Vibe Coding", let's return the source if it's an image, even if full size.
        if (source.contentType().startsWith("image/")) {
            return source;
        }

        throw new IllegalArgumentException("Preview not available for this file type");
    }

    private void saveToCache(Path target, FileContent content) {
        try {
            // content.inputStream() is already consumed?
            // Wait, InputStream can be read only once.
            // PreviewGeneratorPort returns a new FileContent with a fresh InputStream (ByteArrayInputStream).
            // We should save it to disk, then return a NEW stream from disk to the caller.

            Files.copy(content.inputStream(), target);
        } catch (IOException e) {
            log.warn("Failed to save preview to cache", e);
        }
    }

    private String generateCacheKey(String path) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(path.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new FileOperationException("SHA-256 algorithm not found", e);
        }
    }

}
