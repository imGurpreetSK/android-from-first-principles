// region loop
// The loop that runs a block at this time, or null. A test reads it to find the loop of a step.
var currentLoop: FakeLoop? = null
    private set

// A stand-in for a thread with a message loop, for example the main thread.
// No real thread runs. A test drains each queue, so the test sets the order of the steps.
class FakeLoop(private val name: String) {
    private val queue = ArrayDeque<Runnable>()

    fun post(block: Runnable) {
        queue.addLast(block)
    }

    fun runAll() {
        while (queue.isNotEmpty()) {
            currentLoop = this
            queue.removeFirst().run()
            currentLoop = null
        }
    }

    override fun toString() = name
}
// endregion
