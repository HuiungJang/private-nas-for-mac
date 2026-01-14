package com.manas.backend.context.file.infrastructure.image;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.manas.backend.context.file.domain.FileContent;
import com.manas.backend.context.file.domain.PreviewType;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ThumbnailatorAdapterTest {

    private ThumbnailatorAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new ThumbnailatorAdapter();
    }

    @Test
    void shouldGenerateThumbnailForJpg() throws IOException {
        // Given
        byte[] imageBytes = createTestImage("jpg");
        FileContent source = new FileContent("test.jpg", "image/jpeg", imageBytes.length,
                new ByteArrayInputStream(imageBytes));

        // When
        FileContent result = adapter.generate(source, PreviewType.THUMBNAIL);

        // Then
        assertNotNull(result);
        assertEquals("image/jpeg", result.contentType());
        assertTrue(result.size() > 0);
        // We can't easily assert dimensions without parsing the result,
        // but verifying it runs without error and produces output is good for unit test.
    }

    @Test
    void shouldReturnNullForUnsupportedType() {
        FileContent source = new FileContent("test.txt", "text/plain", 10,
                new ByteArrayInputStream(new byte[10]));
        assertNull(adapter.generate(source, PreviewType.THUMBNAIL));
    }

    private byte[] createTestImage(String format) throws IOException {
        BufferedImage img = new BufferedImage(400, 400, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(img, format, baos);
        return baos.toByteArray();
    }

}
