// region binder
// A stand-in for android.os.IBinder. An IBinder is a local Binder or a BinderProxy.
sealed interface IBinder {
    fun transact(code: Int, data: Parcel): Parcel
}

// A stand-in for android.os.Binder: a local object. Each Stub extends it.
abstract class Binder : IBinder {
    override fun transact(code: Int, data: Parcel) = onTransact(code, data)

    abstract fun onTransact(code: Int, data: Parcel): Parcel
}

// A stand-in for BinderProxy and the native BpBinder: one handle in one process.
class BinderProxy(private val process: Process, val handle: Int) : IBinder {
    override fun transact(code: Int, data: Parcel) = process.driver.transact(process, handle, code, data)
}
// endregion

// A stand-in for android.os.IInterface.
interface IInterface {
    fun asBinder(): IBinder
}

// region parcel
// A stand-in for android.os.Parcel. It keeps values and binders in the order of the writes.
class Parcel {
    val items = mutableListOf<Any?>()
    private var next = 0

    fun write(item: Any?) {
        items += item
    }

    fun read(): Any? = items[next++]
}
// endregion
