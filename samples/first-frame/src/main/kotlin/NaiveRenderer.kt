// region view
// A stand-in for android.widget.TextView. The rebuild needs only its text.
data class TextView(var text: String)

// What one draw gives the display: the text, its position and its size.
data class Frame(val text: String, val x: Int, val width: Int)
// endregion

// region display
// A fake display and its VSYNC source. The test calls vsync(), so no clock and no thread run.
class FakeDisplay(val width: Int) {
    private var newFrame: Frame? = null
    var shown: Frame? = null
        private set
    var shownFrames = 0
        private set

    fun post(frame: Frame) {
        newFrame = frame // A later draw before the next VSYNC replaces this frame.
    }

    // At each VSYNC, the display shows the newest frame. If the app drew nothing, the display keeps the old frame.
    fun vsync() {
        val frame = newFrame ?: return
        shown = frame
        shownFrames++
        newFrame = null
    }
}
// endregion

// region renderer
class NaiveRenderer(private val display: FakeDisplay) {
    private val view = TextView("")
    var draws = 0
        private set

    // A stand-in for TextView.setText. New text can change the size of the view, so the view needs a new traversal.
    fun setText(text: String) {
        view.text = text
        // The traversal runs at once for each change. Nothing waits for the next VSYNC.
        traverse()
    }

    private fun traverse() {
        val width = measure()
        val x = layout(width)
        draw(x, width)
    }

    private fun measure() = view.text.length * CHAR_WIDTH

    private fun layout(width: Int) = (display.width - width) / 2 // The view is in the center of the display.

    private fun draw(x: Int, width: Int) {
        display.post(Frame(view.text, x, width))
        draws++
    }
}

// A stand-in for a font in which each character is 10 px wide.
private const val CHAR_WIDTH = 10
// endregion
