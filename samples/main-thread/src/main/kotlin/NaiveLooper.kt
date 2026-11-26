// region time
// The looper reads the time and sleeps only through these two interfaces, so that a test can control both.
interface Clock {
    val now: Long
}

fun interface Sleeper {
    fun sleepUntil(time: Long)
}
// endregion

// region message
// `when` is the time at which the message is due.
class NaiveMessage(val `when`: Long, val block: () -> Unit)
// endregion

// region queue
class NaiveMessageQueue {
    // The list is sorted by `when`, so the head is the next message to run.
    private val messages = mutableListOf<NaiveMessage>()

    fun enqueue(msg: NaiveMessage) {
        // The new message goes after each message with the same `when`, so these messages run in post order.
        val index = messages.indexOfFirst { it.`when` > msg.`when` }
        messages.add(if (index == -1) messages.size else index, msg)
        // The flaw: enqueue does not wake the looper. If the looper sleeps, the new message waits until the sleep ends, also if it is due earlier.
    }

    fun peek(): NaiveMessage? = messages.firstOrNull()

    fun removeHead(): NaiveMessage = messages.removeAt(0)
}
// endregion

// region handler
class NaiveHandler(private val looper: NaiveLooper) {
    fun postDelayed(delay: Long, block: () -> Unit): NaiveMessage =
        NaiveMessage(looper.clock.now + delay, block).also { looper.queue.enqueue(it) }
}
// endregion

// region loop
class NaiveLooper(val clock: Clock, private val sleeper: Sleeper) {
    val queue = NaiveMessageQueue()

    fun loop() {
        while (true) {
            // A real Looper sleeps here until a new message comes. The rebuild returns, so that a test can end.
            val head = queue.peek() ?: return
            if (head.`when` <= clock.now) {
                queue.removeHead()
                head.block()
            } else {
                sleeper.sleepUntil(head.`when`)
            }
        }
    }
}
// endregion
