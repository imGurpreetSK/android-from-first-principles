import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test

class FakeLoopTest {
    @Test
    fun runAll_runsBlocksInPostOrder_withItsLoopAsCurrentLoop() {
        val loop = FakeLoop("test")
        val ran = mutableListOf<Pair<String, FakeLoop?>>()
        loop.post { ran += "A" to currentLoop }
        loop.post { ran += "B" to currentLoop }
        loop.runAll()
        assertEquals(listOf("A" to loop, "B" to loop), ran)
        assertNull(currentLoop)
    }
}
