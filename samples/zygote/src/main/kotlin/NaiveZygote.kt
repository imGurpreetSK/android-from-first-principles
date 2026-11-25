import java.io.ByteArrayOutputStream
import java.io.ObjectInputStream
import java.io.ObjectOutputStream
import java.io.Serializable
import java.util.Random

// region image
// A stand-in for the memory of a process.
class ProcessImage(seed: Long) : Serializable {
    val classes = mutableMapOf<String, String>() // the name of each class to its code
    val random = Random(seed) // Math.random() also uses a java.util.Random.
}
// endregion

// region zygote
class NaiveZygote(private val classNames: List<String>, private val seed: Long) {
    var classLoads = 0
        private set
    private lateinit var image: ProcessImage

    // The zygote loads each class one time, so that no app loads it again.
    fun preload() {
        image = ProcessImage(seed)
        for (name in classNames) {
            image.classes[name] = "code of $name"
            classLoads++
        }
    }

    // The JVM cannot call fork(). A deep copy gives the child its own copy of the full image.
    fun fork(): ProcessImage {
        val bytes = ByteArrayOutputStream()
        ObjectOutputStream(bytes).use { it.writeObject(image) }
        return ObjectInputStream(bytes.toByteArray().inputStream()).use { it.readObject() as ProcessImage }
    }
}
// endregion
