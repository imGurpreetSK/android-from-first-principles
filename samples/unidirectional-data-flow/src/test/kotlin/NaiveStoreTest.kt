import java.util.concurrent.CountDownLatch
import kotlin.concurrent.thread
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

    // region lost-update
    @Test
    fun naiveStore_losesUpdate_whenTwoWritersInterleave() {
        val store = NaiveStore(0)
        val bHasRead = CountDownLatch(1)
        val aHasWritten = CountDownLatch(1)
        // The latches set the order of the two writers, so each run gives the same result.
        val writerB = thread {
            store.update { s ->
                bHasRead.countDown()
                aHasWritten.await()
                s + 1
            }
        }
        bHasRead.await() // Writer B has read 0.
        store.update { it + 1 } // Writer A writes 0 + 1.
        aHasWritten.countDown()
        writerB.join() // Writer B writes 0 + 1 over the 1 of writer A.
        assertEquals(1, store.state)
    }
    // endregion
}
