package com.manas.backend.context.file.infrastructure.image;

import com.manas.backend.common.exception.FileOperationException;
import com.manas.backend.context.file.application.port.out.PreviewGeneratorPort;
import com.manas.backend.context.file.domain.FileContent;
import com.manas.backend.context.file.domain.PreviewType;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ThumbnailatorAdapter implements PreviewGeneratorPort {

    private static final Set<String> SUPPORTED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp"
    );

    @Override
    public FileContent generate(FileContent source, PreviewType type) {
        if (!supports(source.contentType())) {
            log.warn("Unsupported content type for thumbnail generation: {}", source.contentType());
            return null;
        }

        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            Thumbnails.of(source.inputStream())
                    .size(type.getWidth(), type.getHeight())
                    .outputFormat("jpg") // Standardize thumbnails to JPG for consistency
                    .toOutputStream(outputStream);

            byte[] thumbnailBytes = outputStream.toByteArray();

            return new FileContent(
                    "thumbnail_" + source.fileName() + ".jpg",
                    "image/jpeg",
                    thumbnailBytes.length,
                    new ByteArrayInputStream(thumbnailBytes)
            );

        } catch (IOException e) {
            log.error("Failed to generate thumbnail for {}", source.fileName(), e);
            throw new FileOperationException("Thumbnail generation failed", e);
        }
    }

    @Override
    public boolean supports(String contentType) {
        return contentType != null && SUPPORTED_TYPES.contains(contentType.toLowerCase());
    }

}
