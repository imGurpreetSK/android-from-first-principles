import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class FakeLoopTest {
    private val loop = FakeLoop()

    // Each task adds its name and the time at which it ran.
    private val ran = mutableListOf<Pair<String, Long>>()

    private fun schedule(name: String, time: Long) = loop.schedule(time) { ran += name to loop.now }

    @Test
    fun advanceTo_runsEachDueTaskAtItsTime_inOrderOfTime() {
        schedule("B", time = 2)
        schedule("A", time = 1)
        schedule("C", time = 3)
        loop.advanceTo(2)
        assertEquals(listOf("A" to 1L, "B" to 2L), ran)
    }

    @Test
    fun advanceTo_runsTasksWithSameTime_inScheduleOrder() {
        schedule("A", time = 1)
        schedule("B", time = 1)
        loop.advanceTo(1)
        assertEquals(listOf("A" to 1L, "B" to 1L), ran)
    }

    @Test
    fun advanceTo_runsTask_thatAnotherTaskSchedules() {
        loop.schedule(1) { schedule("B", time = loop.now + 1) }
        loop.advanceTo(2)
        assertEquals(listOf("B" to 2L), ran)
    }
}
