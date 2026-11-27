import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class NaiveJobTest {
    // region setup
    private val loop = FakeLoop()
    private val root = NaiveJob()
    private val scope = NaiveScope(root, loop)
    // endregion

    @Test
    fun launch_addsChildJob_toJobOfScope() {
        val child = scope.launch { naiveDelay(1) }
        assertEquals(listOf(child), root.children)
    }

    // region resume
    @Test
    fun naiveDelay_resumesCoroutine_atItsTick() {
        val ticks = mutableListOf<Long>()
        scope.launch {
            ticks += loop.now
            naiveDelay(3)
            ticks += loop.now
        }
        loop.advanceTo(2)
        assertEquals(listOf(0L), ticks)
        loop.advanceTo(3)
        assertEquals(listOf(0L, 3L), ticks)
    }
    // endregion

    @Test
    fun launch_completesJobWithNoFailure_whenBlockReturns() {
        val job = scope.launch { naiveDelay(2) }
        loop.advanceTo(1)
        assertFalse(job.isCompleted)
        loop.advanceTo(2)
        assertTrue(job.isCompleted)
        assertNull(job.failure)
    }

    @Test
    fun launch_completesJobWithFailure_whenBlockThrows() {
        val failure = IllegalStateException()
        val job = scope.launch {
            naiveDelay(1)
            throw failure
        }
        loop.advanceTo(1)
        assertTrue(job.isCompleted)
        assertSame(failure, job.failure)
    }

    @Test
    fun cancel_cancelsChildAndGrandchild() {
        val child = scope.launch { launch { naiveDelay(1) } }
        val grandchild = child.children.single()
        root.cancel()
        assertTrue(root.isCancelled)
        assertTrue(child.isCancelled)
        assertTrue(grandchild.isCancelled)
    }
}
