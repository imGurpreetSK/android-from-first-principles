import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Test

class NaiveContinuationTest {
    // The loops are global. If a test leaves a block in a queue, the next test runs it.
    @AfterEach
    fun drainLoops() {
        io.runAll()
        main.runAll()
    }

    @Test
    fun fetchUser_returnsSuspended_thenIoLoopResumesWithUser() {
        val resumed = mutableListOf<Pair<User, FakeLoop?>>()
        val result = fetchUser(42) { user -> resumed += user to currentLoop }
        assertSame(SUSPENDED, result)
        assertEquals(emptyList<Pair<User, FakeLoop?>>(), resumed)
        io.runAll()
        assertEquals(listOf(User("user 42") to io), resumed)
    }

    @Test
    fun start_setsLabel1_andReturnsBeforeShow() {
        val shown = mutableListOf<Int>()
        val machine = LoadAndShow { userId, _ -> shown += userId }
        main.post { machine.start(42) }
        main.runAll()
        assertEquals(1, machine.label)
        assertEquals(emptyList<Int>(), shown)
    }

    // region spill
    @Test
    fun stateMachine_keepsSpilledLocal_acrossSuspension() {
        val shown = mutableListOf<Pair<Int, User>>()
        val machine = LoadAndShow { userId, user -> shown += userId to user }
        main.post { machine.start(42) }
        main.runAll()
        io.runAll()
        main.runAll()
        assertEquals(listOf(42 to User("user 42")), shown)
    }
    // endregion
}
