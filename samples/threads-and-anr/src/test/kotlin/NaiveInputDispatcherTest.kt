import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class NaiveInputDispatcherTest {
    private val clock = FakeClock()

    @Test
    fun inject_sendsTouchAtOnce_whenWindowHasNoUnfinishedTouch() {
        val window = FakeWindow(clock)
        val dispatcher = NaiveInputDispatcher(clock, window)
        clock.advanceTo(100)
        dispatcher.inject("tap")
        assertEquals(listOf("tap" to 100L), window.received)
    }

    @Test
    fun inject_sendsTouchAtOnce_whenOldestUnfinishedTouchIsYoungerThan500ms() {
        val window = FakeWindow(clock)
        val dispatcher = NaiveInputDispatcher(clock, window)
        dispatcher.inject("tap 1")
        clock.advanceTo(499)
        dispatcher.inject("tap 2")
        assertEquals(listOf("tap 1" to 0L, "tap 2" to 499L), window.received)
    }

    @Test
    fun inject_holdsTouchUntilWindowFinishesOldestTouch_whenOldestIs500msOld() {
        val window = FakeWindow(clock, finishTimes = listOf(4_000))
        val dispatcher = NaiveInputDispatcher(clock, window)
        dispatcher.inject("tap 1")
        clock.advanceTo(500)
        dispatcher.inject("tap 2")
        clock.advanceTo(4_000)
        assertEquals(listOf("tap 1" to 0L, "tap 2" to 4_000L), window.received)
    }

    @Test
    fun dispatcher_reportsNoAnr_whenEachOfTwoTouchesWaitsLessThan5000ms() {
        val window = FakeWindow(clock, finishTimes = listOf(1_000, 5_600, 5_700))
        val dispatcher = NaiveInputDispatcher(clock, window)
        dispatcher.inject("tap 1")
        clock.advanceTo(500)
        dispatcher.inject("tap 2") // It waits from 500 to 1_000.
        clock.advanceTo(1_500)
        dispatcher.inject("tap 3") // It waits from 1_500 to 5_600, more than 5_000 ms after the wait of tap 2 started.
        clock.advanceTo(60_000)
        assertEquals(listOf("tap 1" to 0L, "tap 2" to 1_000L, "tap 3" to 5_600L), window.received)
        assertEquals(emptyList<Long>(), dispatcher.anrs)
    }

    // region flaw
    @Test
    fun naiveDispatcher_reportsNoAnr_whenWindowNeverFinishesTheOnlyEvent() {
        val window = FakeWindow(clock) // No finish times: the main thread never finishes a touch.
        val dispatcher = NaiveInputDispatcher(clock, window)
        dispatcher.inject("tap")
        clock.advanceTo(60_000)
        assertEquals(listOf("tap" to 0L), window.received)
        assertEquals(emptyList<Long>(), dispatcher.anrs)
    }
    // endregion
}
