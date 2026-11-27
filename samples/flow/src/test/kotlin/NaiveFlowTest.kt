import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class NaiveFlowTest {
    // region cold
    @Test
    fun naiveFlow_runsProducerBlock_onceForEachCollector() {
        var runs = 0
        val numbers = naiveFlow<Int> { emit ->
            runs++
            emit(1)
            emit(2)
        }
        assertEquals(0, runs) // Before the first collect call, the block does not run.
        val first = mutableListOf<Int>()
        val second = mutableListOf<Int>()
        numbers.collect { first += it }
        numbers.collect { second += it }
        assertEquals(2, runs)
        assertEquals(listOf(1, 2), first)
        assertEquals(listOf(1, 2), second)
    }
    // endregion
}
