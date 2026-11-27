import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class ProcessDeathTest {
    private val server = FakeSystemServer()

    // region restore
    @Test
    fun naiveRegistry_restoresEachComponent_afterOneProcessDeath() {
        val process1 = FakeProcess(server, "MainActivity")
        Counter(process1.savedStateRegistry, "A").count = 1
        Counter(process1.savedStateRegistry, "B").count = 2
        process1.stopActivity()
        process1.kill()

        val process2 = FakeProcess(server, "MainActivity")
        assertEquals(1, Counter(process2.savedStateRegistry, "A").count)
        assertEquals(2, Counter(process2.savedStateRegistry, "B").count)
    }
    // endregion

    @Test
    fun fakeProcess_restoresCountOfLastStop_whenCountChangesAfterStop() {
        val process1 = FakeProcess(server, "MainActivity")
        val a = Counter(process1.savedStateRegistry, "A")
        a.count = 1
        process1.stopActivity()
        a.count = 5
        process1.kill()

        val process2 = FakeProcess(server, "MainActivity")
        assertEquals(1, Counter(process2.savedStateRegistry, "A").count)
    }

    @Test
    fun fakeProcess_hasNoRegistry_afterKill() {
        val process = FakeProcess(server, "MainActivity")
        process.kill()
        assertThrows<IllegalStateException> { process.savedStateRegistry }
    }
}
