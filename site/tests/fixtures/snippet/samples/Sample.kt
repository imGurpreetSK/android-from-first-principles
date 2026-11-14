package sample

// region loop
fun loop() {
    while (true) println("loop")
}
// endregion

fun outside() = Unit

class LooperTest {
    // region test
    fun loopRuns() {
        loop()
    }
    // endregion
}
