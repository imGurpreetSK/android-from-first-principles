// region process
// A stand-in for one process. It reaches another process only through the driver.
class Process(val driver: NaiveDriver) {
    // The flaw, part 2: each handle that the process gets makes a new proxy.
    fun proxyFor(handle: Int): IBinder = BinderProxy(this, handle)
}
// endregion

// A stand-in for the binder driver in the kernel.
class NaiveDriver {
    // The driver must know the process of each local object, to send each call on the object to that process.
    private val owners = mutableMapOf<Binder, Process>()

    // Each process has its own handle table. A handle is an index in the list of its process.
    private val handles = mutableMapOf<Process, MutableList<Binder>>()

    // region send
    fun send(binder: IBinder, from: Process, to: Process): IBinder {
        val local = when (binder) {
            is Binder -> binder.also { owners.putIfAbsent(it, from) }
            is BinderProxy -> handles.getValue(from)[binder.handle]
        }
        // The flaw, part 1: a new handle each time, also if `to` has a handle for this object, or owns it.
        val table = handles.getOrPut(to) { mutableListOf() }
        table += local
        return to.proxyFor(table.lastIndex)
    }
    // endregion

    // region transact
    fun transact(from: Process, handle: Int, code: Int, data: Parcel): Parcel {
        val target = handles.getValue(from)[handle]
        val owner = owners.getValue(target)
        val reply = target.transact(code, copy(data, from, owner))
        return copy(reply, owner, from)
    }

    // The values go across as they are. Each binder goes across through send().
    private fun copy(parcel: Parcel, from: Process, to: Process) = Parcel().apply {
        for (item in parcel.items) write(if (item is IBinder) send(item, from, to) else item)
    }
    // endregion
}
