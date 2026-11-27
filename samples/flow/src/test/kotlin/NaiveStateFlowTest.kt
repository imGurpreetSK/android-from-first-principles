import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class NaiveStateFlowTest {
    private val queue = FakeQueue()

    @Test
    fun fakeQueue_runsTasksOnlyInRunAll_inPostOrder() {
        val ran = mutableListOf<String>()
        queue.post { ran += "a" }
        queue.post { ran += "b" }
        assertEquals(emptyList<String>(), ran)
        queue.runAll()
        assertEquals(listOf("a", "b"), ran)
    }

    @Test
    fun naiveStateFlow_givesCurrentValue_toNewCollector() {
        val state = NaiveStateFlow(7, queue)
        val seen = mutableListOf<Int>()
        state.collect { seen += it }
        queue.runAll()
        assertEquals(listOf(7), seen)
    }

    @Test
    fun naiveStateFlow_givesWriteToEachCollector_onlyWhenQueueRuns() {
        val state = NaiveStateFlow(0, queue)
        val first = mutableListOf<Int>()
        val second = mutableListOf<Int>()
        state.collect { first += it }
        state.collect { second += it }
        queue.runAll()
        state.value = 5
        assertEquals(5, state.value)
        assertEquals(listOf(0), first)
        assertEquals(listOf(0), second)
        queue.runAll()
        assertEquals(listOf(0, 5), first)
        assertEquals(listOf(0, 5), second)
    }
}
