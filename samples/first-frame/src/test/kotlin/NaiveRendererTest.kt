import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class NaiveRendererTest {
    @Test
    fun setText_drawsMeasuredCenteredText_thatDisplayShowsAtVsync() {
        val display = FakeDisplay(width = 100)
        val renderer = NaiveRenderer(display)
        renderer.setText("Hi")
        display.vsync()
        assertEquals(Frame("Hi", x = 40, width = 20), display.shown)
        assertEquals(1, display.shownFrames)
    }

    @Test
    fun vsync_showsNoNewFrame_whenAppDrewNothing() {
        val display = FakeDisplay(width = 100)
        val renderer = NaiveRenderer(display)
        renderer.setText("Hi")
        display.vsync()
        display.vsync()
        assertEquals(1, display.shownFrames)
    }
}
