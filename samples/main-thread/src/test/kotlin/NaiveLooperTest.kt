import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class NaiveLooperTest {
    // region setup
    private val time = FakeTime()
    private val looper = NaiveLooper(clock = time, sleeper = time)
    private val handler = NaiveHandler(looper)

    // Each message adds its name and the time at which it ran.
    private val ran = mutableListOf<Pair<String, Long>>()

    private fun post(name: String, delay: Long) = handler.postDelayed(delay) { ran += name to time.now }
    // endregion

    // region order
    @Test
    fun loop_runsEachMessageAtItsWhen_inOrderOfWhen() {
        post("C", delay = 300)
        post("A", delay = 100)
        post("B", delay = 200)
        looper.loop()
        assertEquals(listOf("A" to 100L, "B" to 200L, "C" to 300L), ran)
    }
    // endregion

    @Test
    fun loop_runsMessagesWithSameWhen_inPostOrder() {
        post("A", delay = 100)
        post("B", delay = 100)
        looper.loop()
        assertEquals(listOf("A" to 100L, "B" to 100L), ran)
    }

    @Test
    fun loop_runsMessage_thatAnotherMessagePosts() {
        handler.postDelayed(100) { post("B", delay = 50) }
        looper.loop()
        assertEquals(listOf("B" to 150L), ran)
    }

    @Test
    fun loop_runsPostedMessageOnTime_whenItIsDueAfterHead() {
        post("A", delay = 1000)
        time.at(10) { post("B", delay = 2000) }
        looper.loop()
        assertEquals(listOf("A" to 1000L, "B" to 2010L), ran)
    }
}

// region fakes
// One fake for the clock and the sleeper. The test moves the time, so no test waits.
class FakeTime : Clock, Sleeper {
    override var now = 0L
        private set

    // Each event stands for work of another thread, for example a post, at a time.
    private val events = mutableListOf<Pair<Long, () -> Unit>>()

    fun at(time: Long, event: () -> Unit) {
        events += time to event
        events.sortBy { it.first } // The sort is stable, so events with the same time run in script order.
    }

    // Other threads run while the looper sleeps. Thus each event that is not after the end of the sleep runs at its time.
    override fun sleepUntil(time: Long) {
        while (events.isNotEmpty() && events.first().first <= time) {
            val (eventTime, event) = events.removeAt(0)
            now = eventTime
            event()
        }
        now = time
    }
}
// endregion
