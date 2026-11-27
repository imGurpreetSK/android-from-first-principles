import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class NaiveStoreTest {
    @Test
    fun observe_givesCurrentStateToNewObserver() {
        val store = NaiveStore(7)
        val seen = mutableListOf<Int>()
        store.observe { seen += it }
        assertEquals(listOf(7), seen)
    }

    @Test
    fun update_writesNextState_andGivesItToEachObserver() {
        val store = NaiveStore(0)
        val first = mutableListOf<Int>()
        val second = mutableListOf<Int>()
        store.observe { first += it }
        store.observe { second += it }
        store.update { it + 1 }
        store.update { it * 10 }
        assertEquals(10, store.state)
        assertEquals(listOf(0, 1, 10), first)
        assertEquals(listOf(0, 1, 10), second)
    }

    // region events
    @Test
    fun counterHolder_rendersNewCount_afterEachIncrementEvent() {
        val holder = CounterHolder()
        val screen = mutableListOf<String>()
        holder.observe { screen += "Count: ${it.count}" }
        holder.onIncrement()
        holder.onIncrement()
        assertEquals(listOf("Count: 0", "Count: 1", "Count: 2"), screen)
    }
    // endregion
}
