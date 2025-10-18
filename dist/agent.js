📦
262624 /src/index.js
✄
// node_modules/frida-il2cpp-bridge/dist/index.js
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Il2Cpp2;
(function(Il2Cpp3) {
  Il2Cpp3.application = {
    /**
     * Gets the data path name of the current application, e.g.
     * `/data/emulated/0/Android/data/com.example.application/files`
     * on Android.
     *
     * **This information is not guaranteed to exist.**
     *
     * ```ts
     * Il2Cpp.perform(() => {
     *     // prints /data/emulated/0/Android/data/com.example.application/files
     *     console.log(Il2Cpp.application.dataPath);
     * });
     * ```
     */
    get dataPath() {
      return unityEngineCall("get_persistentDataPath");
    },
    /**
     * Gets the identifier name of the current application, e.g.
     * `com.example.application` on Android.
     *
     * In case the identifier cannot be retrieved, the main module name is
     * returned instead, which typically is the process name.
     *
     * ```ts
     * Il2Cpp.perform(() => {
     *     // prints com.example.application
     *     console.log(Il2Cpp.application.identifier);
     * });
     * ```
     */
    get identifier() {
      return unityEngineCall("get_identifier") ?? unityEngineCall("get_bundleIdentifier") ?? Process.mainModule.name;
    },
    /**
     * Gets the version name of the current application, e.g. `4.12.8`.
     *
     * In case the version cannot be retrieved, an hash of the IL2CPP
     * module is returned instead.
     *
     * ```ts
     * Il2Cpp.perform(() => {
     *     // prints 4.12.8
     *     console.log(Il2Cpp.application.version);
     * });
     * ```
     */
    get version() {
      return unityEngineCall("get_version") ?? exportsHash(Il2Cpp3.module).toString(16);
    }
  };
  getter(Il2Cpp3, "unityVersion", () => {
    try {
      const unityVersion = Il2Cpp3.$config.unityVersion ?? unityEngineCall("get_unityVersion");
      if (unityVersion != null) {
        return unityVersion;
      }
    } catch (_) {
    }
    const searchPattern = "69 6c 32 63 70 70";
    for (const range of Il2Cpp3.module.enumerateRanges("r--").concat(Process.getRangeByAddress(Il2Cpp3.module.base))) {
      for (let { address } of Memory.scanSync(range.base, range.size, searchPattern)) {
        while (address.readU8() != 0) {
          address = address.sub(1);
        }
        const match = UnityVersion.find(address.add(1).readCString());
        if (match != void 0) {
          return match;
        }
      }
    }
    raise("couldn't determine the Unity version, please specify it manually");
  }, lazy);
  getter(Il2Cpp3, "unityVersionIsBelow201830", () => {
    return UnityVersion.lt(Il2Cpp3.unityVersion, "2018.3.0");
  }, lazy);
  getter(Il2Cpp3, "unityVersionIsBelow202120", () => {
    return UnityVersion.lt(Il2Cpp3.unityVersion, "2021.2.0");
  }, lazy);
  function unityEngineCall(method) {
    const handle = Il2Cpp3.exports.resolveInternalCall(Memory.allocUtf8String("UnityEngine.Application::" + method));
    const nativeFunction = new NativeFunction(handle, "pointer", []);
    return nativeFunction.isNull() ? null : new Il2Cpp3.String(nativeFunction()).asNullable()?.content ?? null;
  }
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  function boxed(value, type) {
    const mapping = {
      int8: "System.SByte",
      uint8: "System.Byte",
      int16: "System.Int16",
      uint16: "System.UInt16",
      int32: "System.Int32",
      uint32: "System.UInt32",
      int64: "System.Int64",
      uint64: "System.UInt64",
      char: "System.Char",
      intptr: "System.IntPtr",
      uintptr: "System.UIntPtr"
    };
    const className = typeof value == "boolean" ? "System.Boolean" : typeof value == "number" ? mapping[type ?? "int32"] : value instanceof Int64 ? "System.Int64" : value instanceof UInt64 ? "System.UInt64" : value instanceof NativePointer ? mapping[type ?? "intptr"] : raise(`Cannot create boxed primitive using value of type '${typeof value}'`);
    const object = Il2Cpp3.corlib.class(className ?? raise(`Unknown primitive type name '${type}'`)).alloc();
    (object.tryField("m_value") ?? object.tryField("_pointer") ?? raise(`Could not find primitive field in class '${className}'`)).value = value;
    return object;
  }
  Il2Cpp3.boxed = boxed;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  Il2Cpp3.$config = {
    moduleName: void 0,
    unityVersion: void 0,
    exports: void 0
  };
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  function dump(fileName, path) {
    fileName = fileName ?? `${Il2Cpp3.application.identifier}_${Il2Cpp3.application.version}.cs`;
    path = path ?? Il2Cpp3.application.dataPath ?? Process.getCurrentDir();
    createDirectoryRecursively(path);
    const destination = `${path}/${fileName}`;
    const file = new File(destination, "w");
    for (const assembly of Il2Cpp3.domain.assemblies) {
      inform(`dumping ${assembly.name}...`);
      for (const klass of assembly.image.classes) {
        file.write(`${klass}

`);
      }
    }
    file.flush();
    file.close();
    ok(`dump saved to ${destination}`);
    showDeprecationNotice();
  }
  Il2Cpp3.dump = dump;
  function dumpTree(path, ignoreAlreadyExistingDirectory = false) {
    path = path ?? `${Il2Cpp3.application.dataPath ?? Process.getCurrentDir()}/${Il2Cpp3.application.identifier}_${Il2Cpp3.application.version}`;
    if (!ignoreAlreadyExistingDirectory && directoryExists(path)) {
      raise(`directory ${path} already exists - pass ignoreAlreadyExistingDirectory = true to skip this check`);
    }
    for (const assembly of Il2Cpp3.domain.assemblies) {
      inform(`dumping ${assembly.name}...`);
      const destination = `${path}/${assembly.name.replaceAll(".", "/")}.cs`;
      createDirectoryRecursively(destination.substring(0, destination.lastIndexOf("/")));
      const file = new File(destination, "w");
      for (const klass of assembly.image.classes) {
        file.write(`${klass}

`);
      }
      file.flush();
      file.close();
    }
    ok(`dump saved to ${path}`);
    showDeprecationNotice();
  }
  Il2Cpp3.dumpTree = dumpTree;
  function directoryExists(path) {
    return Il2Cpp3.corlib.class("System.IO.Directory").method("Exists").invoke(Il2Cpp3.string(path));
  }
  function createDirectoryRecursively(path) {
    Il2Cpp3.corlib.class("System.IO.Directory").method("CreateDirectory").invoke(Il2Cpp3.string(path));
  }
  function showDeprecationNotice() {
    warn("this api will be removed in a future release, please use `npx frida-il2cpp-bridge dump` instead");
  }
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  function installExceptionListener(targetThread = "current") {
    const currentThread = Il2Cpp3.exports.threadGetCurrent();
    return Interceptor.attach(Il2Cpp3.module.getExportByName("__cxa_throw"), function(args) {
      if (targetThread == "current" && !Il2Cpp3.exports.threadGetCurrent().equals(currentThread)) {
        return;
      }
      inform(new Il2Cpp3.Object(args[0].readPointer()));
    });
  }
  Il2Cpp3.installExceptionListener = installExceptionListener;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  Il2Cpp3.exports = {
    get alloc() {
      return r("il2cpp_alloc", "pointer", ["size_t"]);
    },
    get arrayGetLength() {
      return r("il2cpp_array_length", "uint32", ["pointer"]);
    },
    get arrayNew() {
      return r("il2cpp_array_new", "pointer", ["pointer", "uint32"]);
    },
    get assemblyGetImage() {
      return r("il2cpp_assembly_get_image", "pointer", ["pointer"]);
    },
    get classForEach() {
      return r("il2cpp_class_for_each", "void", ["pointer", "pointer"]);
    },
    get classFromName() {
      return r("il2cpp_class_from_name", "pointer", ["pointer", "pointer", "pointer"]);
    },
    get classFromObject() {
      return r("il2cpp_class_from_system_type", "pointer", ["pointer"]);
    },
    get classGetArrayClass() {
      return r("il2cpp_array_class_get", "pointer", ["pointer", "uint32"]);
    },
    get classGetArrayElementSize() {
      return r("il2cpp_class_array_element_size", "int", ["pointer"]);
    },
    get classGetAssemblyName() {
      return r("il2cpp_class_get_assemblyname", "pointer", ["pointer"]);
    },
    get classGetBaseType() {
      return r("il2cpp_class_enum_basetype", "pointer", ["pointer"]);
    },
    get classGetDeclaringType() {
      return r("il2cpp_class_get_declaring_type", "pointer", ["pointer"]);
    },
    get classGetElementClass() {
      return r("il2cpp_class_get_element_class", "pointer", ["pointer"]);
    },
    get classGetFieldFromName() {
      return r("il2cpp_class_get_field_from_name", "pointer", ["pointer", "pointer"]);
    },
    get classGetFields() {
      return r("il2cpp_class_get_fields", "pointer", ["pointer", "pointer"]);
    },
    get classGetFlags() {
      return r("il2cpp_class_get_flags", "int", ["pointer"]);
    },
    get classGetImage() {
      return r("il2cpp_class_get_image", "pointer", ["pointer"]);
    },
    get classGetInstanceSize() {
      return r("il2cpp_class_instance_size", "int32", ["pointer"]);
    },
    get classGetInterfaces() {
      return r("il2cpp_class_get_interfaces", "pointer", ["pointer", "pointer"]);
    },
    get classGetMethodFromName() {
      return r("il2cpp_class_get_method_from_name", "pointer", ["pointer", "pointer", "int"]);
    },
    get classGetMethods() {
      return r("il2cpp_class_get_methods", "pointer", ["pointer", "pointer"]);
    },
    get classGetName() {
      return r("il2cpp_class_get_name", "pointer", ["pointer"]);
    },
    get classGetNamespace() {
      return r("il2cpp_class_get_namespace", "pointer", ["pointer"]);
    },
    get classGetNestedClasses() {
      return r("il2cpp_class_get_nested_types", "pointer", ["pointer", "pointer"]);
    },
    get classGetParent() {
      return r("il2cpp_class_get_parent", "pointer", ["pointer"]);
    },
    get classGetStaticFieldData() {
      return r("il2cpp_class_get_static_field_data", "pointer", ["pointer"]);
    },
    get classGetValueTypeSize() {
      return r("il2cpp_class_value_size", "int32", ["pointer", "pointer"]);
    },
    get classGetType() {
      return r("il2cpp_class_get_type", "pointer", ["pointer"]);
    },
    get classHasReferences() {
      return r("il2cpp_class_has_references", "bool", ["pointer"]);
    },
    get classInitialize() {
      return r("il2cpp_runtime_class_init", "void", ["pointer"]);
    },
    get classIsAbstract() {
      return r("il2cpp_class_is_abstract", "bool", ["pointer"]);
    },
    get classIsAssignableFrom() {
      return r("il2cpp_class_is_assignable_from", "bool", ["pointer", "pointer"]);
    },
    get classIsBlittable() {
      return r("il2cpp_class_is_blittable", "bool", ["pointer"]);
    },
    get classIsEnum() {
      return r("il2cpp_class_is_enum", "bool", ["pointer"]);
    },
    get classIsGeneric() {
      return r("il2cpp_class_is_generic", "bool", ["pointer"]);
    },
    get classIsInflated() {
      return r("il2cpp_class_is_inflated", "bool", ["pointer"]);
    },
    get classIsInterface() {
      return r("il2cpp_class_is_interface", "bool", ["pointer"]);
    },
    get classIsSubclassOf() {
      return r("il2cpp_class_is_subclass_of", "bool", ["pointer", "pointer", "bool"]);
    },
    get classIsValueType() {
      return r("il2cpp_class_is_valuetype", "bool", ["pointer"]);
    },
    get domainGetAssemblyFromName() {
      return r("il2cpp_domain_assembly_open", "pointer", ["pointer", "pointer"]);
    },
    get domainGet() {
      return r("il2cpp_domain_get", "pointer", []);
    },
    get domainGetAssemblies() {
      return r("il2cpp_domain_get_assemblies", "pointer", ["pointer", "pointer"]);
    },
    get fieldGetClass() {
      return r("il2cpp_field_get_parent", "pointer", ["pointer"]);
    },
    get fieldGetFlags() {
      return r("il2cpp_field_get_flags", "int", ["pointer"]);
    },
    get fieldGetName() {
      return r("il2cpp_field_get_name", "pointer", ["pointer"]);
    },
    get fieldGetOffset() {
      return r("il2cpp_field_get_offset", "int32", ["pointer"]);
    },
    get fieldGetStaticValue() {
      return r("il2cpp_field_static_get_value", "void", ["pointer", "pointer"]);
    },
    get fieldGetType() {
      return r("il2cpp_field_get_type", "pointer", ["pointer"]);
    },
    get fieldSetStaticValue() {
      return r("il2cpp_field_static_set_value", "void", ["pointer", "pointer"]);
    },
    get free() {
      return r("il2cpp_free", "void", ["pointer"]);
    },
    get gcCollect() {
      return r("il2cpp_gc_collect", "void", ["int"]);
    },
    get gcCollectALittle() {
      return r("il2cpp_gc_collect_a_little", "void", []);
    },
    get gcDisable() {
      return r("il2cpp_gc_disable", "void", []);
    },
    get gcEnable() {
      return r("il2cpp_gc_enable", "void", []);
    },
    get gcGetHeapSize() {
      return r("il2cpp_gc_get_heap_size", "int64", []);
    },
    get gcGetMaxTimeSlice() {
      return r("il2cpp_gc_get_max_time_slice_ns", "int64", []);
    },
    get gcGetUsedSize() {
      return r("il2cpp_gc_get_used_size", "int64", []);
    },
    get gcHandleGetTarget() {
      return r("il2cpp_gchandle_get_target", "pointer", ["uint32"]);
    },
    get gcHandleFree() {
      return r("il2cpp_gchandle_free", "void", ["uint32"]);
    },
    get gcHandleNew() {
      return r("il2cpp_gchandle_new", "uint32", ["pointer", "bool"]);
    },
    get gcHandleNewWeakRef() {
      return r("il2cpp_gchandle_new_weakref", "uint32", ["pointer", "bool"]);
    },
    get gcIsDisabled() {
      return r("il2cpp_gc_is_disabled", "bool", []);
    },
    get gcIsIncremental() {
      return r("il2cpp_gc_is_incremental", "bool", []);
    },
    get gcSetMaxTimeSlice() {
      return r("il2cpp_gc_set_max_time_slice_ns", "void", ["int64"]);
    },
    get gcStartIncrementalCollection() {
      return r("il2cpp_gc_start_incremental_collection", "void", []);
    },
    get gcStartWorld() {
      return r("il2cpp_start_gc_world", "void", []);
    },
    get gcStopWorld() {
      return r("il2cpp_stop_gc_world", "void", []);
    },
    get getCorlib() {
      return r("il2cpp_get_corlib", "pointer", []);
    },
    get imageGetAssembly() {
      return r("il2cpp_image_get_assembly", "pointer", ["pointer"]);
    },
    get imageGetClass() {
      return r("il2cpp_image_get_class", "pointer", ["pointer", "uint"]);
    },
    get imageGetClassCount() {
      return r("il2cpp_image_get_class_count", "uint32", ["pointer"]);
    },
    get imageGetName() {
      return r("il2cpp_image_get_name", "pointer", ["pointer"]);
    },
    get initialize() {
      return r("il2cpp_init", "void", ["pointer"]);
    },
    get livenessAllocateStruct() {
      return r("il2cpp_unity_liveness_allocate_struct", "pointer", ["pointer", "int", "pointer", "pointer", "pointer"]);
    },
    get livenessCalculationBegin() {
      return r("il2cpp_unity_liveness_calculation_begin", "pointer", ["pointer", "int", "pointer", "pointer", "pointer", "pointer"]);
    },
    get livenessCalculationEnd() {
      return r("il2cpp_unity_liveness_calculation_end", "void", ["pointer"]);
    },
    get livenessCalculationFromStatics() {
      return r("il2cpp_unity_liveness_calculation_from_statics", "void", ["pointer"]);
    },
    get livenessFinalize() {
      return r("il2cpp_unity_liveness_finalize", "void", ["pointer"]);
    },
    get livenessFreeStruct() {
      return r("il2cpp_unity_liveness_free_struct", "void", ["pointer"]);
    },
    get memorySnapshotCapture() {
      return r("il2cpp_capture_memory_snapshot", "pointer", []);
    },
    get memorySnapshotFree() {
      return r("il2cpp_free_captured_memory_snapshot", "void", ["pointer"]);
    },
    get memorySnapshotGetClasses() {
      return r("il2cpp_memory_snapshot_get_classes", "pointer", ["pointer", "pointer"]);
    },
    get memorySnapshotGetObjects() {
      return r("il2cpp_memory_snapshot_get_objects", "pointer", ["pointer", "pointer"]);
    },
    get methodGetClass() {
      return r("il2cpp_method_get_class", "pointer", ["pointer"]);
    },
    get methodGetFlags() {
      return r("il2cpp_method_get_flags", "uint32", ["pointer", "pointer"]);
    },
    get methodGetName() {
      return r("il2cpp_method_get_name", "pointer", ["pointer"]);
    },
    get methodGetObject() {
      return r("il2cpp_method_get_object", "pointer", ["pointer", "pointer"]);
    },
    get methodGetParameterCount() {
      return r("il2cpp_method_get_param_count", "uint8", ["pointer"]);
    },
    get methodGetParameterName() {
      return r("il2cpp_method_get_param_name", "pointer", ["pointer", "uint32"]);
    },
    get methodGetParameters() {
      return r("il2cpp_method_get_parameters", "pointer", ["pointer", "pointer"]);
    },
    get methodGetParameterType() {
      return r("il2cpp_method_get_param", "pointer", ["pointer", "uint32"]);
    },
    get methodGetReturnType() {
      return r("il2cpp_method_get_return_type", "pointer", ["pointer"]);
    },
    get methodIsGeneric() {
      return r("il2cpp_method_is_generic", "bool", ["pointer"]);
    },
    get methodIsInflated() {
      return r("il2cpp_method_is_inflated", "bool", ["pointer"]);
    },
    get methodIsInstance() {
      return r("il2cpp_method_is_instance", "bool", ["pointer"]);
    },
    get monitorEnter() {
      return r("il2cpp_monitor_enter", "void", ["pointer"]);
    },
    get monitorExit() {
      return r("il2cpp_monitor_exit", "void", ["pointer"]);
    },
    get monitorPulse() {
      return r("il2cpp_monitor_pulse", "void", ["pointer"]);
    },
    get monitorPulseAll() {
      return r("il2cpp_monitor_pulse_all", "void", ["pointer"]);
    },
    get monitorTryEnter() {
      return r("il2cpp_monitor_try_enter", "bool", ["pointer", "uint32"]);
    },
    get monitorTryWait() {
      return r("il2cpp_monitor_try_wait", "bool", ["pointer", "uint32"]);
    },
    get monitorWait() {
      return r("il2cpp_monitor_wait", "void", ["pointer"]);
    },
    get objectGetClass() {
      return r("il2cpp_object_get_class", "pointer", ["pointer"]);
    },
    get objectGetVirtualMethod() {
      return r("il2cpp_object_get_virtual_method", "pointer", ["pointer", "pointer"]);
    },
    get objectInitialize() {
      return r("il2cpp_runtime_object_init_exception", "void", ["pointer", "pointer"]);
    },
    get objectNew() {
      return r("il2cpp_object_new", "pointer", ["pointer"]);
    },
    get objectGetSize() {
      return r("il2cpp_object_get_size", "uint32", ["pointer"]);
    },
    get objectUnbox() {
      return r("il2cpp_object_unbox", "pointer", ["pointer"]);
    },
    get resolveInternalCall() {
      return r("il2cpp_resolve_icall", "pointer", ["pointer"]);
    },
    get stringGetChars() {
      return r("il2cpp_string_chars", "pointer", ["pointer"]);
    },
    get stringGetLength() {
      return r("il2cpp_string_length", "int32", ["pointer"]);
    },
    get stringNew() {
      return r("il2cpp_string_new", "pointer", ["pointer"]);
    },
    get valueTypeBox() {
      return r("il2cpp_value_box", "pointer", ["pointer", "pointer"]);
    },
    get threadAttach() {
      return r("il2cpp_thread_attach", "pointer", ["pointer"]);
    },
    get threadDetach() {
      return r("il2cpp_thread_detach", "void", ["pointer"]);
    },
    get threadGetAttachedThreads() {
      return r("il2cpp_thread_get_all_attached_threads", "pointer", ["pointer"]);
    },
    get threadGetCurrent() {
      return r("il2cpp_thread_current", "pointer", []);
    },
    get threadIsVm() {
      return r("il2cpp_is_vm_thread", "bool", ["pointer"]);
    },
    get typeEquals() {
      return r("il2cpp_type_equals", "bool", ["pointer", "pointer"]);
    },
    get typeGetClass() {
      return r("il2cpp_class_from_type", "pointer", ["pointer"]);
    },
    get typeGetName() {
      return r("il2cpp_type_get_name", "pointer", ["pointer"]);
    },
    get typeGetObject() {
      return r("il2cpp_type_get_object", "pointer", ["pointer"]);
    },
    get typeGetTypeEnum() {
      return r("il2cpp_type_get_type", "int", ["pointer"]);
    }
  };
  decorate(Il2Cpp3.exports, lazy);
  getter(Il2Cpp3, "memorySnapshotExports", () => new CModule("#include <stdint.h>\n#include <string.h>\n\ntypedef struct Il2CppManagedMemorySnapshot Il2CppManagedMemorySnapshot;\ntypedef struct Il2CppMetadataType Il2CppMetadataType;\n\nstruct Il2CppManagedMemorySnapshot\n{\n  struct Il2CppManagedHeap\n  {\n    uint32_t section_count;\n    void * sections;\n  } heap;\n  struct Il2CppStacks\n  {\n    uint32_t stack_count;\n    void * stacks;\n  } stacks;\n  struct Il2CppMetadataSnapshot\n  {\n    uint32_t type_count;\n    Il2CppMetadataType * types;\n  } metadata_snapshot;\n  struct Il2CppGCHandles\n  {\n    uint32_t tracked_object_count;\n    void ** pointers_to_objects;\n  } gc_handles;\n  struct Il2CppRuntimeInformation\n  {\n    uint32_t pointer_size;\n    uint32_t object_header_size;\n    uint32_t array_header_size;\n    uint32_t array_bounds_offset_in_header;\n    uint32_t array_size_offset_in_header;\n    uint32_t allocation_granularity;\n  } runtime_information;\n  void * additional_user_information;\n};\n\nstruct Il2CppMetadataType\n{\n  uint32_t flags;\n  void * fields;\n  uint32_t field_count;\n  uint32_t statics_size;\n  uint8_t * statics;\n  uint32_t base_or_element_type_index;\n  char * name;\n  const char * assembly_name;\n  uint64_t type_info_address;\n  uint32_t size;\n};\n\nuintptr_t\nil2cpp_memory_snapshot_get_classes (\n    const Il2CppManagedMemorySnapshot * snapshot, Il2CppMetadataType ** iter)\n{\n  const int zero = 0;\n  const void * null = 0;\n\n  if (iter != NULL && snapshot->metadata_snapshot.type_count > zero)\n  {\n    if (*iter == null)\n    {\n      *iter = snapshot->metadata_snapshot.types;\n      return (uintptr_t) (*iter)->type_info_address;\n    }\n    else\n    {\n      Il2CppMetadataType * metadata_type = *iter + 1;\n\n      if (metadata_type < snapshot->metadata_snapshot.types +\n                              snapshot->metadata_snapshot.type_count)\n      {\n        *iter = metadata_type;\n        return (uintptr_t) (*iter)->type_info_address;\n      }\n    }\n  }\n  return 0;\n}\n\nvoid **\nil2cpp_memory_snapshot_get_objects (\n    const Il2CppManagedMemorySnapshot * snapshot, uint32_t * size)\n{\n  *size = snapshot->gc_handles.tracked_object_count;\n  return snapshot->gc_handles.pointers_to_objects;\n}\n"), lazy);
  function r(exportName, retType, argTypes) {
    const handle = Il2Cpp3.$config.exports?.[exportName]?.() ?? Il2Cpp3.module.findExportByName(exportName) ?? Il2Cpp3.memorySnapshotExports[exportName];
    const target = new NativeFunction(handle ?? NULL, retType, argTypes);
    return target.isNull() ? new Proxy(target, {
      get(value, name) {
        const property = value[name];
        return typeof property === "function" ? property.bind(value) : property;
      },
      apply() {
        if (handle == null) {
          raise(`couldn't resolve export ${exportName}`);
        } else if (handle.isNull()) {
          raise(`export ${exportName} points to NULL IL2CPP library has likely been stripped, obfuscated, or customized`);
        }
      }
    }) : target;
  }
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  function is(klass) {
    return (element) => {
      if (element instanceof Il2Cpp3.Class) {
        return klass.isAssignableFrom(element);
      } else {
        return klass.isAssignableFrom(element.class);
      }
    };
  }
  Il2Cpp3.is = is;
  function isExactly(klass) {
    return (element) => {
      if (element instanceof Il2Cpp3.Class) {
        return element.equals(klass);
      } else {
        return element.class.equals(klass);
      }
    };
  }
  Il2Cpp3.isExactly = isExactly;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  Il2Cpp3.gc = {
    /**
     * Gets the heap size in bytes.
     */
    get heapSize() {
      return Il2Cpp3.exports.gcGetHeapSize();
    },
    /**
     * Determines whether the garbage collector is enabled.
     */
    get isEnabled() {
      return !Il2Cpp3.exports.gcIsDisabled();
    },
    /**
     * Determines whether the garbage collector is incremental
     * ([source](https://docs.unity3d.com/Manual/performance-incremental-garbage-collection.html)).
     */
    get isIncremental() {
      return !!Il2Cpp3.exports.gcIsIncremental();
    },
    /**
     * Gets the number of nanoseconds the garbage collector can spend in a
     * collection step.
     */
    get maxTimeSlice() {
      return Il2Cpp3.exports.gcGetMaxTimeSlice();
    },
    /**
     * Gets the used heap size in bytes.
     */
    get usedHeapSize() {
      return Il2Cpp3.exports.gcGetUsedSize();
    },
    /**
     * Enables or disables the garbage collector.
     */
    set isEnabled(value) {
      value ? Il2Cpp3.exports.gcEnable() : Il2Cpp3.exports.gcDisable();
    },
    /**
     *  Sets the number of nanoseconds the garbage collector can spend in
     * a collection step.
     */
    set maxTimeSlice(nanoseconds) {
      Il2Cpp3.exports.gcSetMaxTimeSlice(nanoseconds);
    },
    /**
     * Returns the heap allocated objects of the specified class. \
     * This variant reads GC descriptors.
     */
    choose(klass) {
      const matches = [];
      const callback = (objects, size) => {
        for (let i = 0; i < size; i++) {
          matches.push(new Il2Cpp3.Object(objects.add(i * Process.pointerSize).readPointer()));
        }
      };
      const chooseCallback = new NativeCallback(callback, "void", ["pointer", "int", "pointer"]);
      if (Il2Cpp3.unityVersionIsBelow202120) {
        const onWorld = new NativeCallback(() => {
        }, "void", []);
        const state = Il2Cpp3.exports.livenessCalculationBegin(klass, 0, chooseCallback, NULL, onWorld, onWorld);
        Il2Cpp3.exports.livenessCalculationFromStatics(state);
        Il2Cpp3.exports.livenessCalculationEnd(state);
      } else {
        const realloc = (handle, size) => {
          if (!handle.isNull() && size.compare(0) == 0) {
            Il2Cpp3.free(handle);
            return NULL;
          } else {
            return Il2Cpp3.alloc(size);
          }
        };
        const reallocCallback = new NativeCallback(realloc, "pointer", ["pointer", "size_t", "pointer"]);
        this.stopWorld();
        const state = Il2Cpp3.exports.livenessAllocateStruct(klass, 0, chooseCallback, NULL, reallocCallback);
        Il2Cpp3.exports.livenessCalculationFromStatics(state);
        Il2Cpp3.exports.livenessFinalize(state);
        this.startWorld();
        Il2Cpp3.exports.livenessFreeStruct(state);
      }
      return matches;
    },
    /**
     * Forces a garbage collection of the specified generation.
     */
    collect(generation) {
      Il2Cpp3.exports.gcCollect(generation < 0 ? 0 : generation > 2 ? 2 : generation);
    },
    /**
     * Forces a garbage collection.
     */
    collectALittle() {
      Il2Cpp3.exports.gcCollectALittle();
    },
    /**
     *  Resumes all the previously stopped threads.
     */
    startWorld() {
      return Il2Cpp3.exports.gcStartWorld();
    },
    /**
     * Performs an incremental garbage collection.
     */
    startIncrementalCollection() {
      return Il2Cpp3.exports.gcStartIncrementalCollection();
    },
    /**
     * Stops all threads which may access the garbage collected heap, other
     * than the caller.
     */
    stopWorld() {
      return Il2Cpp3.exports.gcStopWorld();
    }
  };
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Android;
(function(Android2) {
  getter(Android2, "apiLevel", () => {
    const value = getProperty("ro.build.version.sdk");
    return value ? parseInt(value) : null;
  }, lazy);
  function getProperty(name) {
    const handle = Process.findModuleByName("libc.so")?.findExportByName("__system_property_get");
    if (handle) {
      const __system_property_get = new NativeFunction(handle, "void", ["pointer", "pointer"]);
      const value = Memory.alloc(92).writePointer(NULL);
      __system_property_get(Memory.allocUtf8String(name), value);
      return value.readCString() ?? void 0;
    }
  }
})(Android || (Android = {}));
function raise(message) {
  const error = new Error(message);
  error.name = "Il2CppError";
  error.stack = error.stack?.replace(/^(Il2Cpp)?Error/, "\x1B[0m\x1B[38;5;9mil2cpp\x1B[0m")?.replace(/\n    at (.+) \((.+):(.+)\)/, "\x1B[3m\x1B[2m")?.concat("\x1B[0m");
  throw error;
}
function warn(message) {
  globalThis.console.log(`\x1B[38;5;11mil2cpp\x1B[0m: ${message}`);
}
function ok(message) {
  globalThis.console.log(`\x1B[38;5;10mil2cpp\x1B[0m: ${message}`);
}
function inform(message) {
  globalThis.console.log(`\x1B[38;5;12mil2cpp\x1B[0m: ${message}`);
}
function decorate(target, decorator, descriptors = Object.getOwnPropertyDescriptors(target)) {
  for (const key in descriptors) {
    descriptors[key] = decorator(target, key, descriptors[key]);
  }
  Object.defineProperties(target, descriptors);
  return target;
}
function getter(target, key, get, decorator) {
  globalThis.Object.defineProperty(target, key, decorator?.(target, key, { get, configurable: true }) ?? { get, configurable: true });
}
function cyrb53(str) {
  let h1 = 3735928559;
  let h2 = 1103547991;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507);
  h1 ^= Math.imul(h2 ^ h2 >>> 13, 3266489909);
  h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507);
  h2 ^= Math.imul(h1 ^ h1 >>> 13, 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
function exportsHash(module) {
  return cyrb53(module.enumerateExports().sort((a, b) => a.name.localeCompare(b.name)).map((_) => _.name + _.address.sub(module.base)).join(""));
}
function lazy(_, propertyKey, descriptor) {
  const getter2 = descriptor.get;
  if (!getter2) {
    throw new Error("@lazy can only be applied to getter accessors");
  }
  descriptor.get = function() {
    const value = getter2.call(this);
    Object.defineProperty(this, propertyKey, {
      value,
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      writable: false
    });
    return value;
  };
  return descriptor;
}
var NativeStruct = class {
  handle;
  constructor(handleOrWrapper) {
    if (handleOrWrapper instanceof NativePointer) {
      this.handle = handleOrWrapper;
    } else {
      this.handle = handleOrWrapper.handle;
    }
  }
  equals(other) {
    return this.handle.equals(other.handle);
  }
  isNull() {
    return this.handle.isNull();
  }
  asNullable() {
    return this.isNull() ? null : this;
  }
};
function addFlippedEntries(obj) {
  return Object.keys(obj).reduce((obj2, key) => (obj2[obj2[key]] = key, obj2), obj);
}
NativePointer.prototype.offsetOf = function(condition, depth) {
  depth ??= 512;
  for (let i = 0; depth > 0 ? i < depth : i < -depth; i++) {
    if (condition(depth > 0 ? this.add(i) : this.sub(i))) {
      return i;
    }
  }
  return null;
};
function readNativeIterator(block) {
  const array = [];
  const iterator = Memory.alloc(Process.pointerSize);
  let handle = block(iterator);
  while (!handle.isNull()) {
    array.push(handle);
    handle = block(iterator);
  }
  return array;
}
function readNativeList(block) {
  const lengthPointer = Memory.alloc(Process.pointerSize);
  const startPointer = block(lengthPointer);
  if (startPointer.isNull()) {
    return [];
  }
  const array = new Array(lengthPointer.readInt());
  for (let i = 0; i < array.length; i++) {
    array[i] = startPointer.add(i * Process.pointerSize).readPointer();
  }
  return array;
}
function recycle(Class) {
  return new Proxy(Class, {
    cache: /* @__PURE__ */ new Map(),
    construct(Target, argArray) {
      const handle = argArray[0].toUInt32();
      if (!this.cache.has(handle)) {
        this.cache.set(handle, new Target(argArray[0]));
      }
      return this.cache.get(handle);
    }
  });
}
var UnityVersion;
(function(UnityVersion2) {
  const pattern = /(6\d{3}|20\d{2}|\d)\.(\d)\.(\d{1,2})(?:[abcfp]|rc){0,2}\d?/;
  function find(string) {
    return string?.match(pattern)?.[0];
  }
  UnityVersion2.find = find;
  function gte(a, b) {
    return compare(a, b) >= 0;
  }
  UnityVersion2.gte = gte;
  function lt(a, b) {
    return compare(a, b) < 0;
  }
  UnityVersion2.lt = lt;
  function compare(a, b) {
    const aMatches = a.match(pattern);
    const bMatches = b.match(pattern);
    for (let i = 1; i <= 3; i++) {
      const a2 = Number(aMatches?.[i] ?? -1);
      const b2 = Number(bMatches?.[i] ?? -1);
      if (a2 > b2)
        return 1;
      else if (a2 < b2)
        return -1;
    }
    return 0;
  }
})(UnityVersion || (UnityVersion = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  function alloc(size = Process.pointerSize) {
    return Il2Cpp3.exports.alloc(size);
  }
  Il2Cpp3.alloc = alloc;
  function free(pointer) {
    return Il2Cpp3.exports.free(pointer);
  }
  Il2Cpp3.free = free;
  function read(pointer, type) {
    switch (type.enumValue) {
      case Il2Cpp3.Type.Enum.BOOLEAN:
        return !!pointer.readS8();
      case Il2Cpp3.Type.Enum.BYTE:
        return pointer.readS8();
      case Il2Cpp3.Type.Enum.UBYTE:
        return pointer.readU8();
      case Il2Cpp3.Type.Enum.SHORT:
        return pointer.readS16();
      case Il2Cpp3.Type.Enum.USHORT:
        return pointer.readU16();
      case Il2Cpp3.Type.Enum.INT:
        return pointer.readS32();
      case Il2Cpp3.Type.Enum.UINT:
        return pointer.readU32();
      case Il2Cpp3.Type.Enum.CHAR:
        return pointer.readU16();
      case Il2Cpp3.Type.Enum.LONG:
        return pointer.readS64();
      case Il2Cpp3.Type.Enum.ULONG:
        return pointer.readU64();
      case Il2Cpp3.Type.Enum.FLOAT:
        return pointer.readFloat();
      case Il2Cpp3.Type.Enum.DOUBLE:
        return pointer.readDouble();
      case Il2Cpp3.Type.Enum.NINT:
      case Il2Cpp3.Type.Enum.NUINT:
        return pointer.readPointer();
      case Il2Cpp3.Type.Enum.POINTER:
        return new Il2Cpp3.Pointer(pointer.readPointer(), type.class.baseType);
      case Il2Cpp3.Type.Enum.VALUE_TYPE:
        return new Il2Cpp3.ValueType(pointer, type);
      case Il2Cpp3.Type.Enum.OBJECT:
      case Il2Cpp3.Type.Enum.CLASS:
        return new Il2Cpp3.Object(pointer.readPointer());
      case Il2Cpp3.Type.Enum.GENERIC_INSTANCE:
        return type.class.isValueType ? new Il2Cpp3.ValueType(pointer, type) : new Il2Cpp3.Object(pointer.readPointer());
      case Il2Cpp3.Type.Enum.STRING:
        return new Il2Cpp3.String(pointer.readPointer());
      case Il2Cpp3.Type.Enum.ARRAY:
      case Il2Cpp3.Type.Enum.NARRAY:
        return new Il2Cpp3.Array(pointer.readPointer());
    }
    raise(`couldn't read the value from ${pointer} using an unhandled or unknown type ${type.name} (${type.enumValue}), please file an issue`);
  }
  Il2Cpp3.read = read;
  function write(pointer, value, type) {
    switch (type.enumValue) {
      case Il2Cpp3.Type.Enum.BOOLEAN:
        return pointer.writeS8(+value);
      case Il2Cpp3.Type.Enum.BYTE:
        return pointer.writeS8(value);
      case Il2Cpp3.Type.Enum.UBYTE:
        return pointer.writeU8(value);
      case Il2Cpp3.Type.Enum.SHORT:
        return pointer.writeS16(value);
      case Il2Cpp3.Type.Enum.USHORT:
        return pointer.writeU16(value);
      case Il2Cpp3.Type.Enum.INT:
        return pointer.writeS32(value);
      case Il2Cpp3.Type.Enum.UINT:
        return pointer.writeU32(value);
      case Il2Cpp3.Type.Enum.CHAR:
        return pointer.writeU16(value);
      case Il2Cpp3.Type.Enum.LONG:
        return pointer.writeS64(value);
      case Il2Cpp3.Type.Enum.ULONG:
        return pointer.writeU64(value);
      case Il2Cpp3.Type.Enum.FLOAT:
        return pointer.writeFloat(value);
      case Il2Cpp3.Type.Enum.DOUBLE:
        return pointer.writeDouble(value);
      case Il2Cpp3.Type.Enum.NINT:
      case Il2Cpp3.Type.Enum.NUINT:
      case Il2Cpp3.Type.Enum.POINTER:
      case Il2Cpp3.Type.Enum.STRING:
      case Il2Cpp3.Type.Enum.ARRAY:
      case Il2Cpp3.Type.Enum.NARRAY:
        return pointer.writePointer(value);
      case Il2Cpp3.Type.Enum.VALUE_TYPE:
        return Memory.copy(pointer, value, type.class.valueTypeSize), pointer;
      case Il2Cpp3.Type.Enum.OBJECT:
      case Il2Cpp3.Type.Enum.CLASS:
      case Il2Cpp3.Type.Enum.GENERIC_INSTANCE:
        return value instanceof Il2Cpp3.ValueType ? (Memory.copy(pointer, value, type.class.valueTypeSize), pointer) : pointer.writePointer(value);
    }
    raise(`couldn't write value ${value} to ${pointer} using an unhandled or unknown type ${type.name} (${type.enumValue}), please file an issue`);
  }
  Il2Cpp3.write = write;
  function fromFridaValue(value, type) {
    if (globalThis.Array.isArray(value)) {
      const handle = Memory.alloc(type.class.valueTypeSize);
      const fields = type.class.fields.filter((_) => !_.isStatic);
      for (let i = 0; i < fields.length; i++) {
        const convertedValue = fromFridaValue(value[i], fields[i].type);
        write(handle.add(fields[i].offset).sub(Il2Cpp3.Object.headerSize), convertedValue, fields[i].type);
      }
      return new Il2Cpp3.ValueType(handle, type);
    } else if (value instanceof NativePointer) {
      if (type.isByReference) {
        return new Il2Cpp3.Reference(value, type);
      }
      switch (type.enumValue) {
        case Il2Cpp3.Type.Enum.POINTER:
          return new Il2Cpp3.Pointer(value, type.class.baseType);
        case Il2Cpp3.Type.Enum.STRING:
          return new Il2Cpp3.String(value);
        case Il2Cpp3.Type.Enum.CLASS:
        case Il2Cpp3.Type.Enum.GENERIC_INSTANCE:
        case Il2Cpp3.Type.Enum.OBJECT:
          return new Il2Cpp3.Object(value);
        case Il2Cpp3.Type.Enum.ARRAY:
        case Il2Cpp3.Type.Enum.NARRAY:
          return new Il2Cpp3.Array(value);
        default:
          return value;
      }
    } else if (type.enumValue == Il2Cpp3.Type.Enum.BOOLEAN) {
      return !!value;
    } else if (type.enumValue == Il2Cpp3.Type.Enum.VALUE_TYPE && type.class.isEnum) {
      return fromFridaValue([value], type);
    } else {
      return value;
    }
  }
  Il2Cpp3.fromFridaValue = fromFridaValue;
  function toFridaValue(value) {
    if (typeof value == "boolean") {
      return +value;
    } else if (value instanceof Il2Cpp3.ValueType) {
      if (value.type.class.isEnum) {
        return value.field("value__").value;
      } else {
        const _ = value.type.class.fields.filter((_2) => !_2.isStatic).map((_2) => toFridaValue(_2.bind(value).value));
        return _.length == 0 ? [0] : _;
      }
    } else {
      return value;
    }
  }
  Il2Cpp3.toFridaValue = toFridaValue;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  getter(Il2Cpp3, "module", () => {
    return tryModule() ?? raise("Could not find IL2CPP module");
  });
  async function initialize(blocking = false) {
    const module = tryModule() ?? await new Promise((resolve) => {
      const [moduleName, fallbackModuleName] = getExpectedModuleNames();
      const timeout = setTimeout(() => {
        warn(`after 10 seconds, IL2CPP module '${moduleName}' has not been loaded yet, is the app running?`);
      }, 1e4);
      const moduleObserver = Process.attachModuleObserver({
        onAdded(module2) {
          if (module2.name == moduleName || fallbackModuleName && module2.name == fallbackModuleName) {
            clearTimeout(timeout);
            setImmediate(() => {
              resolve(module2);
              moduleObserver.detach();
            });
          }
        }
      });
    });
    Reflect.defineProperty(Il2Cpp3, "module", { value: module });
    if (Il2Cpp3.exports.getCorlib().isNull()) {
      return await new Promise((resolve) => {
        const interceptor = Interceptor.attach(Il2Cpp3.exports.initialize, {
          onLeave() {
            interceptor.detach();
            blocking ? resolve(true) : setImmediate(() => resolve(false));
          }
        });
      });
    }
    return false;
  }
  Il2Cpp3.initialize = initialize;
  function tryModule() {
    const [moduleName, fallback] = getExpectedModuleNames();
    return Process.findModuleByName(moduleName) ?? Process.findModuleByName(fallback ?? moduleName) ?? (Process.platform == "darwin" ? Process.findModuleByAddress(DebugSymbol.fromName("il2cpp_init").address) : void 0) ?? void 0;
  }
  function getExpectedModuleNames() {
    if (Il2Cpp3.$config.moduleName) {
      return [Il2Cpp3.$config.moduleName];
    }
    switch (Process.platform) {
      case "linux":
        return [Android.apiLevel ? "libil2cpp.so" : "GameAssembly.so"];
      case "windows":
        return ["GameAssembly.dll"];
      case "darwin":
        return ["UnityFramework", "GameAssembly.dylib"];
    }
    raise(`${Process.platform} is not supported yet`);
  }
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  async function perform(block, flag = "bind") {
    let attachedThread = null;
    try {
      const isInMainThread = await Il2Cpp3.initialize(flag == "main");
      if (flag == "main" && !isInMainThread) {
        return perform(() => Il2Cpp3.mainThread.schedule(block), "free");
      }
      if (Il2Cpp3.currentThread == null) {
        attachedThread = Il2Cpp3.domain.attach();
      }
      if (flag == "bind" && attachedThread != null) {
        Script.bindWeak(globalThis, () => attachedThread?.detach());
      }
      const result = block();
      return result instanceof Promise ? await result : result;
    } catch (error) {
      Script.nextTick((_) => {
        throw _;
      }, error);
      return Promise.reject(error);
    } finally {
      if (flag == "free" && attachedThread != null) {
        attachedThread.detach();
      }
    }
  }
  Il2Cpp3.perform = perform;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Tracer {
    /** @internal */
    #state = {
      depth: 0,
      buffer: [],
      history: /* @__PURE__ */ new Set(),
      flush: () => {
        if (this.#state.depth == 0) {
          const message = `
${this.#state.buffer.join("\n")}
`;
          if (this.#verbose) {
            inform(message);
          } else {
            const hash = cyrb53(message);
            if (!this.#state.history.has(hash)) {
              this.#state.history.add(hash);
              inform(message);
            }
          }
          this.#state.buffer.length = 0;
        }
      }
    };
    /** @internal */
    #threadId = Il2Cpp3.mainThread.id;
    /** @internal */
    #verbose = false;
    /** @internal */
    #applier;
    /** @internal */
    #targets = [];
    /** @internal */
    #domain;
    /** @internal */
    #assemblies;
    /** @internal */
    #classes;
    /** @internal */
    #methods;
    /** @internal */
    #assemblyFilter;
    /** @internal */
    #classFilter;
    /** @internal */
    #methodFilter;
    /** @internal */
    #parameterFilter;
    constructor(applier) {
      this.#applier = applier;
    }
    /** */
    thread(thread) {
      this.#threadId = thread.id;
      return this;
    }
    /** Determines whether print duplicate logs. */
    verbose(value) {
      this.#verbose = value;
      return this;
    }
    /** Sets the application domain as the place where to find the target methods. */
    domain() {
      this.#domain = Il2Cpp3.domain;
      return this;
    }
    /** Sets the passed `assemblies` as the place where to find the target methods. */
    assemblies(...assemblies) {
      this.#assemblies = assemblies;
      return this;
    }
    /** Sets the passed `classes` as the place where to find the target methods. */
    classes(...classes) {
      this.#classes = classes;
      return this;
    }
    /** Sets the passed `methods` as the target methods. */
    methods(...methods) {
      this.#methods = methods;
      return this;
    }
    /** Filters the assemblies where to find the target methods. */
    filterAssemblies(filter) {
      this.#assemblyFilter = filter;
      return this;
    }
    /** Filters the classes where to find the target methods. */
    filterClasses(filter) {
      this.#classFilter = filter;
      return this;
    }
    /** Filters the target methods. */
    filterMethods(filter) {
      this.#methodFilter = filter;
      return this;
    }
    /** Filters the target methods. */
    filterParameters(filter) {
      this.#parameterFilter = filter;
      return this;
    }
    /** Commits the current changes by finding the target methods. */
    and() {
      const filterMethod = (method) => {
        if (this.#parameterFilter == void 0) {
          this.#targets.push(method);
          return;
        }
        for (const parameter of method.parameters) {
          if (this.#parameterFilter(parameter)) {
            this.#targets.push(method);
            break;
          }
        }
      };
      const filterMethods = (values) => {
        for (const method of values) {
          filterMethod(method);
        }
      };
      const filterClass = (klass) => {
        if (this.#methodFilter == void 0) {
          filterMethods(klass.methods);
          return;
        }
        for (const method of klass.methods) {
          if (this.#methodFilter(method)) {
            filterMethod(method);
          }
        }
      };
      const filterClasses = (values) => {
        for (const klass of values) {
          filterClass(klass);
        }
      };
      const filterAssembly = (assembly) => {
        if (this.#classFilter == void 0) {
          filterClasses(assembly.image.classes);
          return;
        }
        for (const klass of assembly.image.classes) {
          if (this.#classFilter(klass)) {
            filterClass(klass);
          }
        }
      };
      const filterAssemblies = (assemblies) => {
        for (const assembly of assemblies) {
          filterAssembly(assembly);
        }
      };
      const filterDomain = (domain) => {
        if (this.#assemblyFilter == void 0) {
          filterAssemblies(domain.assemblies);
          return;
        }
        for (const assembly of domain.assemblies) {
          if (this.#assemblyFilter(assembly)) {
            filterAssembly(assembly);
          }
        }
      };
      this.#methods ? filterMethods(this.#methods) : this.#classes ? filterClasses(this.#classes) : this.#assemblies ? filterAssemblies(this.#assemblies) : this.#domain ? filterDomain(this.#domain) : void 0;
      this.#assemblies = void 0;
      this.#classes = void 0;
      this.#methods = void 0;
      this.#assemblyFilter = void 0;
      this.#classFilter = void 0;
      this.#methodFilter = void 0;
      this.#parameterFilter = void 0;
      return this;
    }
    /** Starts tracing. */
    attach() {
      for (const target of this.#targets) {
        if (!target.virtualAddress.isNull()) {
          try {
            this.#applier(target, this.#state, this.#threadId);
          } catch (e) {
            switch (e.message) {
              case /unable to intercept function at \w+; please file a bug/.exec(e.message)?.input:
              case "already replaced this function":
                break;
              default:
                throw e;
            }
          }
        }
      }
    }
  }
  Il2Cpp3.Tracer = Tracer;
  function trace(parameters = false) {
    const applier = () => (method, state, threadId) => {
      const paddedVirtualAddress = method.relativeVirtualAddress.toString(16).padStart(8, "0");
      Interceptor.attach(method.virtualAddress, {
        onEnter() {
          if (this.threadId == threadId) {
            state.buffer.push(`\x1B[2m0x${paddedVirtualAddress}\x1B[0m ${`\u2502 `.repeat(state.depth++)}\u250C\u2500\x1B[35m${method.class.type.name}::\x1B[1m${method.name}\x1B[0m\x1B[0m`);
          }
        },
        onLeave() {
          if (this.threadId == threadId) {
            state.buffer.push(`\x1B[2m0x${paddedVirtualAddress}\x1B[0m ${`\u2502 `.repeat(--state.depth)}\u2514\u2500\x1B[33m${method.class.type.name}::\x1B[1m${method.name}\x1B[0m\x1B[0m`);
            state.flush();
          }
        }
      });
    };
    const applierWithParameters = () => (method, state, threadId) => {
      const paddedVirtualAddress = method.relativeVirtualAddress.toString(16).padStart(8, "0");
      const startIndex = +!method.isStatic | +Il2Cpp3.unityVersionIsBelow201830;
      const callback = function(...args) {
        if (this.threadId == threadId) {
          const thisParameter = method.isStatic ? void 0 : new Il2Cpp3.Parameter("this", -1, method.class.type);
          const parameters2 = thisParameter ? [thisParameter].concat(method.parameters) : method.parameters;
          state.buffer.push(`\x1B[2m0x${paddedVirtualAddress}\x1B[0m ${`\u2502 `.repeat(state.depth++)}\u250C\u2500\x1B[35m${method.class.type.name}::\x1B[1m${method.name}\x1B[0m\x1B[0m(${parameters2.map((e) => `\x1B[32m${e.name}\x1B[0m = \x1B[31m${Il2Cpp3.fromFridaValue(args[e.position + startIndex], e.type)}\x1B[0m`).join(", ")})`);
        }
        const returnValue = method.nativeFunction(...args);
        if (this.threadId == threadId) {
          state.buffer.push(`\x1B[2m0x${paddedVirtualAddress}\x1B[0m ${`\u2502 `.repeat(--state.depth)}\u2514\u2500\x1B[33m${method.class.type.name}::\x1B[1m${method.name}\x1B[0m\x1B[0m${returnValue == void 0 ? "" : ` = \x1B[36m${Il2Cpp3.fromFridaValue(returnValue, method.returnType)}`}\x1B[0m`);
          state.flush();
        }
        return returnValue;
      };
      method.revert();
      const nativeCallback = new NativeCallback(callback, method.returnType.fridaAlias, method.fridaSignature);
      Interceptor.replace(method.virtualAddress, nativeCallback);
    };
    return new Il2Cpp3.Tracer(parameters ? applierWithParameters() : applier());
  }
  Il2Cpp3.trace = trace;
  function backtrace(mode) {
    const methods = Il2Cpp3.domain.assemblies.flatMap((_) => _.image.classes.flatMap((_2) => _2.methods.filter((_3) => !_3.virtualAddress.isNull()))).sort((_, __) => _.virtualAddress.compare(__.virtualAddress));
    const searchInsert = (target) => {
      let left = 0;
      let right = methods.length - 1;
      while (left <= right) {
        const pivot = Math.floor((left + right) / 2);
        const comparison = methods[pivot].virtualAddress.compare(target);
        if (comparison == 0) {
          return methods[pivot];
        } else if (comparison > 0) {
          right = pivot - 1;
        } else {
          left = pivot + 1;
        }
      }
      return methods[right];
    };
    const applier = () => (method, state, threadId) => {
      Interceptor.attach(method.virtualAddress, function() {
        if (this.threadId == threadId) {
          const handles = globalThis.Thread.backtrace(this.context, mode);
          handles.unshift(method.virtualAddress);
          for (const handle of handles) {
            if (handle.compare(Il2Cpp3.module.base) > 0 && handle.compare(Il2Cpp3.module.base.add(Il2Cpp3.module.size)) < 0) {
              const method2 = searchInsert(handle);
              if (method2) {
                const offset = handle.sub(method2.virtualAddress);
                if (offset.compare(4095) < 0) {
                  state.buffer.push(`\x1B[2m0x${method2.relativeVirtualAddress.toString(16).padStart(8, "0")}\x1B[0m\x1B[2m+0x${offset.toString(16).padStart(3, `0`)}\x1B[0m ${method2.class.type.name}::\x1B[1m${method2.name}\x1B[0m`);
                }
              }
            }
          }
          state.flush();
        }
      });
    };
    return new Il2Cpp3.Tracer(applier());
  }
  Il2Cpp3.backtrace = backtrace;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Array2 extends NativeStruct {
    /** Gets the Il2CppArray struct size, possibly equal to `Process.pointerSize * 4`. */
    static get headerSize() {
      return Il2Cpp3.corlib.class("System.Array").instanceSize;
    }
    /** @internal Gets a pointer to the first element of the current array. */
    get elements() {
      const array2 = Il2Cpp3.string("v").object.method("ToCharArray", 0).invoke();
      const offset = array2.handle.offsetOf((_) => _.readS16() == 118) ?? raise("couldn't find the elements offset in the native array struct");
      getter(Il2Cpp3.Array.prototype, "elements", function() {
        return new Il2Cpp3.Pointer(this.handle.add(offset), this.elementType);
      }, lazy);
      return this.elements;
    }
    /** Gets the size of the object encompassed by the current array. */
    get elementSize() {
      return this.elementType.class.arrayElementSize;
    }
    /** Gets the type of the object encompassed by the current array. */
    get elementType() {
      return this.object.class.type.class.baseType;
    }
    /** Gets the total number of elements in all the dimensions of the current array. */
    get length() {
      return Il2Cpp3.exports.arrayGetLength(this);
    }
    /** Gets the encompassing object of the current array. */
    get object() {
      return new Il2Cpp3.Object(this);
    }
    /** Gets the element at the specified index of the current array. */
    get(index) {
      if (index < 0 || index >= this.length) {
        raise(`cannot get element at index ${index} as the array length is ${this.length}`);
      }
      return this.elements.get(index);
    }
    /** Sets the element at the specified index of the current array. */
    set(index, value) {
      if (index < 0 || index >= this.length) {
        raise(`cannot set element at index ${index} as the array length is ${this.length}`);
      }
      this.elements.set(index, value);
    }
    /** */
    toString() {
      return this.isNull() ? "null" : `[${this.elements.read(this.length, 0)}]`;
    }
    /** Iterable. */
    *[Symbol.iterator]() {
      for (let i = 0; i < this.length; i++) {
        yield this.elements.get(i);
      }
    }
  }
  __decorate([
    lazy
  ], Array2.prototype, "elementSize", null);
  __decorate([
    lazy
  ], Array2.prototype, "elementType", null);
  __decorate([
    lazy
  ], Array2.prototype, "length", null);
  __decorate([
    lazy
  ], Array2.prototype, "object", null);
  __decorate([
    lazy
  ], Array2, "headerSize", null);
  Il2Cpp3.Array = Array2;
  function array(klass, lengthOrElements) {
    const length = typeof lengthOrElements == "number" ? lengthOrElements : lengthOrElements.length;
    const array2 = new Il2Cpp3.Array(Il2Cpp3.exports.arrayNew(klass, length));
    if (globalThis.Array.isArray(lengthOrElements)) {
      array2.elements.write(lengthOrElements);
    }
    return array2;
  }
  Il2Cpp3.array = array;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  let Assembly = class Assembly extends NativeStruct {
    /** Gets the image of this assembly. */
    get image() {
      if (Il2Cpp3.exports.assemblyGetImage.isNull()) {
        const runtimeModule = this.object.tryMethod("GetType", 1)?.invoke(Il2Cpp3.string("<Module>"))?.asNullable()?.tryMethod("get_Module")?.invoke() ?? this.object.tryMethod("GetModules", 1)?.invoke(false)?.get(0) ?? raise(`couldn't find the runtime module object of assembly ${this.name}`);
        return new Il2Cpp3.Image(runtimeModule.field("_impl").value);
      }
      return new Il2Cpp3.Image(Il2Cpp3.exports.assemblyGetImage(this));
    }
    /** Gets the name of this assembly. */
    get name() {
      return this.image.name.replace(".dll", "");
    }
    /** Gets the encompassing object of the current assembly. */
    get object() {
      for (const _ of Il2Cpp3.domain.object.method("GetAssemblies", 1).invoke(false)) {
        if (_.field("_mono_assembly").value.equals(this)) {
          return _;
        }
      }
      raise("couldn't find the object of the native assembly struct");
    }
  };
  __decorate([
    lazy
  ], Assembly.prototype, "name", null);
  __decorate([
    lazy
  ], Assembly.prototype, "object", null);
  Assembly = __decorate([
    recycle
  ], Assembly);
  Il2Cpp3.Assembly = Assembly;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  let Class = class Class extends NativeStruct {
    /** Gets the actual size of the instance of the current class. */
    get actualInstanceSize() {
      const SystemString = Il2Cpp3.corlib.class("System.String");
      const offset = SystemString.handle.offsetOf((_) => _.readInt() == SystemString.instanceSize - 2) ?? raise("couldn't find the actual instance size offset in the native class struct");
      getter(Il2Cpp3.Class.prototype, "actualInstanceSize", function() {
        return this.handle.add(offset).readS32();
      }, lazy);
      return this.actualInstanceSize;
    }
    /** Gets the array class which encompass the current class. */
    get arrayClass() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.classGetArrayClass(this, 1));
    }
    /** Gets the size of the object encompassed by the current array class. */
    get arrayElementSize() {
      return Il2Cpp3.exports.classGetArrayElementSize(this);
    }
    /** Gets the name of the assembly in which the current class is defined. */
    get assemblyName() {
      return Il2Cpp3.exports.classGetAssemblyName(this).readUtf8String().replace(".dll", "");
    }
    /** Gets the class that declares the current nested class. */
    get declaringClass() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.classGetDeclaringType(this)).asNullable();
    }
    /** Gets the encompassed type of this array, reference, pointer or enum type. */
    get baseType() {
      return new Il2Cpp3.Type(Il2Cpp3.exports.classGetBaseType(this)).asNullable();
    }
    /** Gets the class of the object encompassed or referred to by the current array, pointer or reference class. */
    get elementClass() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.classGetElementClass(this)).asNullable();
    }
    /** Gets the fields of the current class. */
    get fields() {
      return readNativeIterator((_) => Il2Cpp3.exports.classGetFields(this, _)).map((_) => new Il2Cpp3.Field(_));
    }
    /** Gets the flags of the current class. */
    get flags() {
      return Il2Cpp3.exports.classGetFlags(this);
    }
    /** Gets the full name (namespace + name) of the current class. */
    get fullName() {
      return this.namespace ? `${this.namespace}.${this.name}` : this.name;
    }
    /** Gets the generic class of the current class if the current class is inflated. */
    get genericClass() {
      const klass = this.image.tryClass(this.fullName)?.asNullable();
      return klass?.equals(this) ? null : klass ?? null;
    }
    /** Gets the generics parameters of this generic class. */
    get generics() {
      if (!this.isGeneric && !this.isInflated) {
        return [];
      }
      const types = this.type.object.method("GetGenericArguments").invoke();
      return globalThis.Array.from(types).map((_) => new Il2Cpp3.Class(Il2Cpp3.exports.classFromObject(_)));
    }
    /** Determines whether the GC has tracking references to the current class instances. */
    get hasReferences() {
      return !!Il2Cpp3.exports.classHasReferences(this);
    }
    /** Determines whether ther current class has a valid static constructor. */
    get hasStaticConstructor() {
      const staticConstructor = this.tryMethod(".cctor");
      return staticConstructor != null && !staticConstructor.virtualAddress.isNull();
    }
    /** Gets the image in which the current class is defined. */
    get image() {
      return new Il2Cpp3.Image(Il2Cpp3.exports.classGetImage(this));
    }
    /** Gets the size of the instance of the current class. */
    get instanceSize() {
      return Il2Cpp3.exports.classGetInstanceSize(this);
    }
    /** Determines whether the current class is abstract. */
    get isAbstract() {
      return !!Il2Cpp3.exports.classIsAbstract(this);
    }
    /** Determines whether the current class is blittable. */
    get isBlittable() {
      return !!Il2Cpp3.exports.classIsBlittable(this);
    }
    /** Determines whether the current class is an enumeration. */
    get isEnum() {
      return !!Il2Cpp3.exports.classIsEnum(this);
    }
    /** Determines whether the current class is a generic one. */
    get isGeneric() {
      return !!Il2Cpp3.exports.classIsGeneric(this);
    }
    /** Determines whether the current class is inflated. */
    get isInflated() {
      return !!Il2Cpp3.exports.classIsInflated(this);
    }
    /** Determines whether the current class is an interface. */
    get isInterface() {
      return !!Il2Cpp3.exports.classIsInterface(this);
    }
    /** Determines whether the current class is a struct. */
    get isStruct() {
      return this.isValueType && !this.isEnum;
    }
    /** Determines whether the current class is a value type. */
    get isValueType() {
      return !!Il2Cpp3.exports.classIsValueType(this);
    }
    /** Gets the interfaces implemented or inherited by the current class. */
    get interfaces() {
      return readNativeIterator((_) => Il2Cpp3.exports.classGetInterfaces(this, _)).map((_) => new Il2Cpp3.Class(_));
    }
    /** Gets the methods implemented by the current class. */
    get methods() {
      return readNativeIterator((_) => Il2Cpp3.exports.classGetMethods(this, _)).map((_) => new Il2Cpp3.Method(_));
    }
    /** Gets the name of the current class. */
    get name() {
      return Il2Cpp3.exports.classGetName(this).readUtf8String();
    }
    /** Gets the namespace of the current class. */
    get namespace() {
      return Il2Cpp3.exports.classGetNamespace(this).readUtf8String() || void 0;
    }
    /** Gets the classes nested inside the current class. */
    get nestedClasses() {
      return readNativeIterator((_) => Il2Cpp3.exports.classGetNestedClasses(this, _)).map((_) => new Il2Cpp3.Class(_));
    }
    /** Gets the class from which the current class directly inherits. */
    get parent() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.classGetParent(this)).asNullable();
    }
    /** Gets the pointer class of the current class. */
    get pointerClass() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.classFromObject(this.type.object.method("MakePointerType").invoke()));
    }
    /** Gets the rank (number of dimensions) of the current array class. */
    get rank() {
      let rank = 0;
      const name = this.name;
      for (let i = this.name.length - 1; i > 0; i--) {
        const c = name[i];
        if (c == "]")
          rank++;
        else if (c == "[" || rank == 0)
          break;
        else if (c == ",")
          rank++;
        else
          break;
      }
      return rank;
    }
    /** Gets a pointer to the static fields of the current class. */
    get staticFieldsData() {
      return Il2Cpp3.exports.classGetStaticFieldData(this);
    }
    /** Gets the size of the instance - as a value type - of the current class. */
    get valueTypeSize() {
      return Il2Cpp3.exports.classGetValueTypeSize(this, NULL);
    }
    /** Gets the type of the current class. */
    get type() {
      return new Il2Cpp3.Type(Il2Cpp3.exports.classGetType(this));
    }
    /** Allocates a new object of the current class. */
    alloc() {
      return new Il2Cpp3.Object(Il2Cpp3.exports.objectNew(this));
    }
    /** Gets the field identified by the given name. */
    field(name) {
      return this.tryField(name) ?? raise(`couldn't find field ${name} in class ${this.type.name}`);
    }
    /** Gets the hierarchy of the current class. */
    *hierarchy(options) {
      let klass = options?.includeCurrent ?? true ? this : this.parent;
      while (klass) {
        yield klass;
        klass = klass.parent;
      }
    }
    /** Builds a generic instance of the current generic class. */
    inflate(...classes) {
      if (!this.isGeneric) {
        raise(`cannot inflate class ${this.type.name} as it has no generic parameters`);
      }
      if (this.generics.length != classes.length) {
        raise(`cannot inflate class ${this.type.name} as it needs ${this.generics.length} generic parameter(s), not ${classes.length}`);
      }
      const types = classes.map((_) => _.type.object);
      const typeArray = Il2Cpp3.array(Il2Cpp3.corlib.class("System.Type"), types);
      const inflatedType = this.type.object.method("MakeGenericType", 1).invoke(typeArray);
      return new Il2Cpp3.Class(Il2Cpp3.exports.classFromObject(inflatedType));
    }
    /** Calls the static constructor of the current class. */
    initialize() {
      Il2Cpp3.exports.classInitialize(this);
      return this;
    }
    /** Determines whether an instance of `other` class can be assigned to a variable of the current type. */
    isAssignableFrom(other) {
      return !!Il2Cpp3.exports.classIsAssignableFrom(this, other);
    }
    /** Determines whether the current class derives from `other` class. */
    isSubclassOf(other, checkInterfaces) {
      return !!Il2Cpp3.exports.classIsSubclassOf(this, other, +checkInterfaces);
    }
    /** Gets the method identified by the given name and parameter count. */
    method(name, parameterCount = -1) {
      return this.tryMethod(name, parameterCount) ?? raise(`couldn't find method ${name} in class ${this.type.name}`);
    }
    /** Gets the nested class with the given name. */
    nested(name) {
      return this.tryNested(name) ?? raise(`couldn't find nested class ${name} in class ${this.type.name}`);
    }
    /** Allocates a new object of the current class and calls its default constructor. */
    new() {
      const object = this.alloc();
      const exceptionArray = Memory.alloc(Process.pointerSize);
      Il2Cpp3.exports.objectInitialize(object, exceptionArray);
      const exception = exceptionArray.readPointer();
      if (!exception.isNull()) {
        raise(new Il2Cpp3.Object(exception).toString());
      }
      return object;
    }
    /** Gets the field with the given name. */
    tryField(name) {
      return new Il2Cpp3.Field(Il2Cpp3.exports.classGetFieldFromName(this, Memory.allocUtf8String(name))).asNullable();
    }
    /** Gets the method with the given name and parameter count. */
    tryMethod(name, parameterCount = -1) {
      return new Il2Cpp3.Method(Il2Cpp3.exports.classGetMethodFromName(this, Memory.allocUtf8String(name), parameterCount)).asNullable();
    }
    /** Gets the nested class with the given name. */
    tryNested(name) {
      return this.nestedClasses.find((_) => _.name == name);
    }
    /** */
    toString() {
      const inherited = [this.parent].concat(this.interfaces);
      return `// ${this.assemblyName}
${this.isEnum ? `enum` : this.isStruct ? `struct` : this.isInterface ? `interface` : `class`} ${this.type.name}${inherited ? ` : ${inherited.map((_) => _?.type.name).join(`, `)}` : ``}
{
    ${this.fields.join(`
    `)}
    ${this.methods.join(`
    `)}
}`;
    }
    /** Executes a callback for every defined class. */
    static enumerate(block) {
      const callback = new NativeCallback((_) => block(new Il2Cpp3.Class(_)), "void", ["pointer", "pointer"]);
      return Il2Cpp3.exports.classForEach(callback, NULL);
    }
  };
  __decorate([
    lazy
  ], Class.prototype, "arrayClass", null);
  __decorate([
    lazy
  ], Class.prototype, "arrayElementSize", null);
  __decorate([
    lazy
  ], Class.prototype, "assemblyName", null);
  __decorate([
    lazy
  ], Class.prototype, "declaringClass", null);
  __decorate([
    lazy
  ], Class.prototype, "baseType", null);
  __decorate([
    lazy
  ], Class.prototype, "elementClass", null);
  __decorate([
    lazy
  ], Class.prototype, "fields", null);
  __decorate([
    lazy
  ], Class.prototype, "flags", null);
  __decorate([
    lazy
  ], Class.prototype, "fullName", null);
  __decorate([
    lazy
  ], Class.prototype, "generics", null);
  __decorate([
    lazy
  ], Class.prototype, "hasReferences", null);
  __decorate([
    lazy
  ], Class.prototype, "hasStaticConstructor", null);
  __decorate([
    lazy
  ], Class.prototype, "image", null);
  __decorate([
    lazy
  ], Class.prototype, "instanceSize", null);
  __decorate([
    lazy
  ], Class.prototype, "isAbstract", null);
  __decorate([
    lazy
  ], Class.prototype, "isBlittable", null);
  __decorate([
    lazy
  ], Class.prototype, "isEnum", null);
  __decorate([
    lazy
  ], Class.prototype, "isGeneric", null);
  __decorate([
    lazy
  ], Class.prototype, "isInflated", null);
  __decorate([
    lazy
  ], Class.prototype, "isInterface", null);
  __decorate([
    lazy
  ], Class.prototype, "isValueType", null);
  __decorate([
    lazy
  ], Class.prototype, "interfaces", null);
  __decorate([
    lazy
  ], Class.prototype, "methods", null);
  __decorate([
    lazy
  ], Class.prototype, "name", null);
  __decorate([
    lazy
  ], Class.prototype, "namespace", null);
  __decorate([
    lazy
  ], Class.prototype, "nestedClasses", null);
  __decorate([
    lazy
  ], Class.prototype, "parent", null);
  __decorate([
    lazy
  ], Class.prototype, "pointerClass", null);
  __decorate([
    lazy
  ], Class.prototype, "rank", null);
  __decorate([
    lazy
  ], Class.prototype, "staticFieldsData", null);
  __decorate([
    lazy
  ], Class.prototype, "valueTypeSize", null);
  __decorate([
    lazy
  ], Class.prototype, "type", null);
  Class = __decorate([
    recycle
  ], Class);
  Il2Cpp3.Class = Class;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  function delegate(klass, block) {
    const SystemDelegate = Il2Cpp3.corlib.class("System.Delegate");
    const SystemMulticastDelegate = Il2Cpp3.corlib.class("System.MulticastDelegate");
    if (!SystemDelegate.isAssignableFrom(klass)) {
      raise(`cannot create a delegate for ${klass.type.name} as it's a non-delegate class`);
    }
    if (klass.equals(SystemDelegate) || klass.equals(SystemMulticastDelegate)) {
      raise(`cannot create a delegate for neither ${SystemDelegate.type.name} nor ${SystemMulticastDelegate.type.name}, use a subclass instead`);
    }
    const delegate2 = klass.alloc();
    const key = delegate2.handle.toString();
    const Invoke = delegate2.tryMethod("Invoke") ?? raise(`cannot create a delegate for ${klass.type.name}, there is no Invoke method`);
    delegate2.method(".ctor").invoke(delegate2, Invoke.handle);
    const callback = Invoke.wrap(block);
    delegate2.field("method_ptr").value = callback;
    delegate2.field("invoke_impl").value = callback;
    Il2Cpp3._callbacksToKeepAlive[key] = callback;
    return delegate2;
  }
  Il2Cpp3.delegate = delegate;
  Il2Cpp3._callbacksToKeepAlive = {};
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  let Domain = class Domain extends NativeStruct {
    /** Gets the assemblies that have been loaded into the execution context of the application domain. */
    get assemblies() {
      let handles = readNativeList((_) => Il2Cpp3.exports.domainGetAssemblies(this, _));
      if (handles.length == 0) {
        const assemblyObjects = this.object.method("GetAssemblies").overload().invoke();
        handles = globalThis.Array.from(assemblyObjects).map((_) => _.field("_mono_assembly").value);
      }
      return handles.map((_) => new Il2Cpp3.Assembly(_));
    }
    /** Gets the encompassing object of the application domain. */
    get object() {
      return Il2Cpp3.corlib.class("System.AppDomain").method("get_CurrentDomain").invoke();
    }
    /** Opens and loads the assembly with the given name. */
    assembly(name) {
      return this.tryAssembly(name) ?? raise(`couldn't find assembly ${name}`);
    }
    /** Attached a new thread to the application domain. */
    attach() {
      return new Il2Cpp3.Thread(Il2Cpp3.exports.threadAttach(this));
    }
    /** Opens and loads the assembly with the given name. */
    tryAssembly(name) {
      return new Il2Cpp3.Assembly(Il2Cpp3.exports.domainGetAssemblyFromName(this, Memory.allocUtf8String(name))).asNullable();
    }
  };
  __decorate([
    lazy
  ], Domain.prototype, "assemblies", null);
  __decorate([
    lazy
  ], Domain.prototype, "object", null);
  Domain = __decorate([
    recycle
  ], Domain);
  Il2Cpp3.Domain = Domain;
  getter(Il2Cpp3, "domain", () => {
    return new Il2Cpp3.Domain(Il2Cpp3.exports.domainGet());
  }, lazy);
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Field extends NativeStruct {
    /** Gets the class in which this field is defined. */
    get class() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.fieldGetClass(this));
    }
    /** Gets the flags of the current field. */
    get flags() {
      return Il2Cpp3.exports.fieldGetFlags(this);
    }
    /** Determines whether this field value is known at compile time. */
    get isLiteral() {
      return (this.flags & 64) != 0;
    }
    /** Determines whether this field is static. */
    get isStatic() {
      return (this.flags & 16) != 0;
    }
    /** Determines whether this field is thread static. */
    get isThreadStatic() {
      const offset = Il2Cpp3.corlib.class("System.AppDomain").field("type_resolve_in_progress").offset;
      getter(Il2Cpp3.Field.prototype, "isThreadStatic", function() {
        return this.offset == offset;
      }, lazy);
      return this.isThreadStatic;
    }
    /** Gets the access modifier of this field. */
    get modifier() {
      switch (this.flags & 7) {
        case 1:
          return "private";
        case 2:
          return "private protected";
        case 3:
          return "internal";
        case 4:
          return "protected";
        case 5:
          return "protected internal";
        case 6:
          return "public";
      }
    }
    /** Gets the name of this field. */
    get name() {
      return Il2Cpp3.exports.fieldGetName(this).readUtf8String();
    }
    /** Gets the offset of this field, calculated as the difference with its owner virtual address. */
    get offset() {
      return Il2Cpp3.exports.fieldGetOffset(this);
    }
    /** Gets the type of this field. */
    get type() {
      return new Il2Cpp3.Type(Il2Cpp3.exports.fieldGetType(this));
    }
    /** Gets the value of this field. */
    get value() {
      if (!this.isStatic) {
        raise(`cannot access instance field ${this.class.type.name}::${this.name} from a class, use an object instead`);
      }
      const handle = Memory.alloc(Process.pointerSize);
      Il2Cpp3.exports.fieldGetStaticValue(this.handle, handle);
      return Il2Cpp3.read(handle, this.type);
    }
    /** Sets the value of this field. Thread static or literal values cannot be altered yet. */
    set value(value) {
      if (!this.isStatic) {
        raise(`cannot access instance field ${this.class.type.name}::${this.name} from a class, use an object instead`);
      }
      if (this.isThreadStatic || this.isLiteral) {
        raise(`cannot write the value of field ${this.name} as it's thread static or literal`);
      }
      const handle = (
        // pointer-like values should be passed as-is, but boxed
        // value types (primitives included) must be unboxed first
        value instanceof Il2Cpp3.Object && this.type.class.isValueType ? value.unbox() : value instanceof NativeStruct ? value.handle : value instanceof NativePointer ? value : Il2Cpp3.write(Memory.alloc(this.type.class.valueTypeSize), value, this.type)
      );
      Il2Cpp3.exports.fieldSetStaticValue(this.handle, handle);
    }
    /** */
    toString() {
      return `${this.isThreadStatic ? `[ThreadStatic] ` : ``}${this.isStatic ? `static ` : ``}${this.type.name} ${this.name}${this.isLiteral ? ` = ${this.type.class.isEnum ? Il2Cpp3.read(this.value.handle, this.type.class.baseType) : this.value}` : ``};${this.isThreadStatic || this.isLiteral ? `` : ` // 0x${this.offset.toString(16)}`}`;
    }
    /**
     * @internal
     * Binds the current field to a {@link Il2Cpp.Object} or a
     * {@link Il2Cpp.ValueType} (also known as *instances*), so that it is
     * possible to retrieve its value - see {@link Il2Cpp.Field.value} for
     * details. \
     * Binding a static field is forbidden.
     */
    bind(instance) {
      if (this.isStatic) {
        raise(`cannot bind static field ${this.class.type.name}::${this.name} to an instance`);
      }
      const offset = this.offset - (instance instanceof Il2Cpp3.ValueType ? Il2Cpp3.Object.headerSize : 0);
      return new Proxy(this, {
        get(target, property) {
          if (property == "value") {
            return Il2Cpp3.read(instance.handle.add(offset), target.type);
          }
          return Reflect.get(target, property);
        },
        set(target, property, value) {
          if (property == "value") {
            Il2Cpp3.write(instance.handle.add(offset), value, target.type);
            return true;
          }
          return Reflect.set(target, property, value);
        }
      });
    }
  }
  __decorate([
    lazy
  ], Field.prototype, "class", null);
  __decorate([
    lazy
  ], Field.prototype, "flags", null);
  __decorate([
    lazy
  ], Field.prototype, "isLiteral", null);
  __decorate([
    lazy
  ], Field.prototype, "isStatic", null);
  __decorate([
    lazy
  ], Field.prototype, "isThreadStatic", null);
  __decorate([
    lazy
  ], Field.prototype, "modifier", null);
  __decorate([
    lazy
  ], Field.prototype, "name", null);
  __decorate([
    lazy
  ], Field.prototype, "offset", null);
  __decorate([
    lazy
  ], Field.prototype, "type", null);
  Il2Cpp3.Field = Field;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class GCHandle {
    handle;
    /** @internal */
    constructor(handle) {
      this.handle = handle;
    }
    /** Gets the object associated to this handle. */
    get target() {
      return new Il2Cpp3.Object(Il2Cpp3.exports.gcHandleGetTarget(this.handle)).asNullable();
    }
    /** Frees this handle. */
    free() {
      return Il2Cpp3.exports.gcHandleFree(this.handle);
    }
  }
  Il2Cpp3.GCHandle = GCHandle;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  let Image = class Image extends NativeStruct {
    /** Gets the assembly in which the current image is defined. */
    get assembly() {
      return new Il2Cpp3.Assembly(Il2Cpp3.exports.imageGetAssembly(this));
    }
    /** Gets the amount of classes defined in this image. */
    get classCount() {
      if (Il2Cpp3.unityVersionIsBelow201830) {
        return this.classes.length;
      } else {
        return Il2Cpp3.exports.imageGetClassCount(this);
      }
    }
    /** Gets the classes defined in this image. */
    get classes() {
      if (Il2Cpp3.unityVersionIsBelow201830) {
        const types = this.assembly.object.method("GetTypes").invoke(false);
        const classes = globalThis.Array.from(types, (_) => new Il2Cpp3.Class(Il2Cpp3.exports.classFromObject(_)));
        const Module = this.tryClass("<Module>");
        if (Module) {
          classes.unshift(Module);
        }
        return classes;
      } else {
        return globalThis.Array.from(globalThis.Array(this.classCount), (_, i) => new Il2Cpp3.Class(Il2Cpp3.exports.imageGetClass(this, i)));
      }
    }
    /** Gets the name of this image. */
    get name() {
      return Il2Cpp3.exports.imageGetName(this).readUtf8String();
    }
    /** Gets the class with the specified name defined in this image. */
    class(name) {
      return this.tryClass(name) ?? raise(`couldn't find class ${name} in assembly ${this.name}`);
    }
    /** Gets the class with the specified name defined in this image. */
    tryClass(name) {
      const dotIndex = name.lastIndexOf(".");
      const classNamespace = Memory.allocUtf8String(dotIndex == -1 ? "" : name.slice(0, dotIndex));
      const className = Memory.allocUtf8String(name.slice(dotIndex + 1));
      return new Il2Cpp3.Class(Il2Cpp3.exports.classFromName(this, classNamespace, className)).asNullable();
    }
  };
  __decorate([
    lazy
  ], Image.prototype, "assembly", null);
  __decorate([
    lazy
  ], Image.prototype, "classCount", null);
  __decorate([
    lazy
  ], Image.prototype, "classes", null);
  __decorate([
    lazy
  ], Image.prototype, "name", null);
  Image = __decorate([
    recycle
  ], Image);
  Il2Cpp3.Image = Image;
  getter(Il2Cpp3, "corlib", () => {
    return new Il2Cpp3.Image(Il2Cpp3.exports.getCorlib());
  }, lazy);
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class MemorySnapshot extends NativeStruct {
    /** Captures a memory snapshot. */
    static capture() {
      return new Il2Cpp3.MemorySnapshot();
    }
    /** Creates a memory snapshot with the given handle. */
    constructor(handle = Il2Cpp3.exports.memorySnapshotCapture()) {
      super(handle);
    }
    /** Gets any initialized class. */
    get classes() {
      return readNativeIterator((_) => Il2Cpp3.exports.memorySnapshotGetClasses(this, _)).map((_) => new Il2Cpp3.Class(_));
    }
    /** Gets the objects tracked by this memory snapshot. */
    get objects() {
      return readNativeList((_) => Il2Cpp3.exports.memorySnapshotGetObjects(this, _)).filter((_) => !_.isNull()).map((_) => new Il2Cpp3.Object(_));
    }
    /** Frees this memory snapshot. */
    free() {
      Il2Cpp3.exports.memorySnapshotFree(this);
    }
  }
  __decorate([
    lazy
  ], MemorySnapshot.prototype, "classes", null);
  __decorate([
    lazy
  ], MemorySnapshot.prototype, "objects", null);
  Il2Cpp3.MemorySnapshot = MemorySnapshot;
  function memorySnapshot(block) {
    const memorySnapshot2 = Il2Cpp3.MemorySnapshot.capture();
    const result = block(memorySnapshot2);
    memorySnapshot2.free();
    return result;
  }
  Il2Cpp3.memorySnapshot = memorySnapshot;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Method extends NativeStruct {
    /** Gets the class in which this method is defined. */
    get class() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.methodGetClass(this));
    }
    /** Gets the flags of the current method. */
    get flags() {
      return Il2Cpp3.exports.methodGetFlags(this, NULL);
    }
    /** Gets the implementation flags of the current method. */
    get implementationFlags() {
      const implementationFlagsPointer = Memory.alloc(Process.pointerSize);
      Il2Cpp3.exports.methodGetFlags(this, implementationFlagsPointer);
      return implementationFlagsPointer.readU32();
    }
    /** */
    get fridaSignature() {
      const types = [];
      for (const parameter of this.parameters) {
        types.push(parameter.type.fridaAlias);
      }
      if (!this.isStatic || Il2Cpp3.unityVersionIsBelow201830) {
        types.unshift("pointer");
      }
      if (this.isInflated) {
        types.push("pointer");
      }
      return types;
    }
    /** Gets the generic parameters of this generic method. */
    get generics() {
      if (!this.isGeneric && !this.isInflated) {
        return [];
      }
      const types = this.object.method("GetGenericArguments").invoke();
      return globalThis.Array.from(types).map((_) => new Il2Cpp3.Class(Il2Cpp3.exports.classFromObject(_)));
    }
    /** Determines whether this method is external. */
    get isExternal() {
      return (this.implementationFlags & 4096) != 0;
    }
    /** Determines whether this method is generic. */
    get isGeneric() {
      return !!Il2Cpp3.exports.methodIsGeneric(this);
    }
    /** Determines whether this method is inflated (generic with a concrete type parameter). */
    get isInflated() {
      return !!Il2Cpp3.exports.methodIsInflated(this);
    }
    /** Determines whether this method is static. */
    get isStatic() {
      return !Il2Cpp3.exports.methodIsInstance(this);
    }
    /** Determines whether this method is synchronized. */
    get isSynchronized() {
      return (this.implementationFlags & 32) != 0;
    }
    /** Gets the access modifier of this method. */
    get modifier() {
      switch (this.flags & 7) {
        case 1:
          return "private";
        case 2:
          return "private protected";
        case 3:
          return "internal";
        case 4:
          return "protected";
        case 5:
          return "protected internal";
        case 6:
          return "public";
      }
    }
    /** Gets the name of this method. */
    get name() {
      return Il2Cpp3.exports.methodGetName(this).readUtf8String();
    }
    /** @internal */
    get nativeFunction() {
      return new NativeFunction(this.virtualAddress, this.returnType.fridaAlias, this.fridaSignature);
    }
    /** Gets the encompassing object of the current method. */
    get object() {
      return new Il2Cpp3.Object(Il2Cpp3.exports.methodGetObject(this, NULL));
    }
    /** Gets the amount of parameters of this method. */
    get parameterCount() {
      return Il2Cpp3.exports.methodGetParameterCount(this);
    }
    /** Gets the parameters of this method. */
    get parameters() {
      return globalThis.Array.from(globalThis.Array(this.parameterCount), (_, i) => {
        const parameterName = Il2Cpp3.exports.methodGetParameterName(this, i).readUtf8String();
        const parameterType = Il2Cpp3.exports.methodGetParameterType(this, i);
        return new Il2Cpp3.Parameter(parameterName, i, new Il2Cpp3.Type(parameterType));
      });
    }
    /** Gets the relative virtual address (RVA) of this method. */
    get relativeVirtualAddress() {
      return this.virtualAddress.sub(Il2Cpp3.module.base);
    }
    /** Gets the return type of this method. */
    get returnType() {
      return new Il2Cpp3.Type(Il2Cpp3.exports.methodGetReturnType(this));
    }
    /** Gets the virtual address (VA) of this method. */
    get virtualAddress() {
      const FilterTypeName = Il2Cpp3.corlib.class("System.Reflection.Module").initialize().field("FilterTypeName").value;
      const FilterTypeNameMethodPointer = FilterTypeName.field("method_ptr").value;
      const FilterTypeNameMethod = FilterTypeName.field("method").value;
      const offset = FilterTypeNameMethod.offsetOf((_) => _.readPointer().equals(FilterTypeNameMethodPointer)) ?? raise("couldn't find the virtual address offset in the native method struct");
      getter(Il2Cpp3.Method.prototype, "virtualAddress", function() {
        return this.handle.add(offset).readPointer();
      }, lazy);
      Il2Cpp3.corlib.class("System.Reflection.Module").method(".cctor").invoke();
      return this.virtualAddress;
    }
    /** Replaces the body of this method. */
    set implementation(block) {
      try {
        Interceptor.replace(this.virtualAddress, this.wrap(block));
      } catch (e) {
        switch (e.message) {
          case "access violation accessing 0x0":
            raise(`couldn't set implementation for method ${this.name} as it has a NULL virtual address`);
          case /unable to intercept function at \w+; please file a bug/.exec(e.message)?.input:
            warn(`couldn't set implementation for method ${this.name} as it may be a thunk`);
            break;
          case "already replaced this function":
            warn(`couldn't set implementation for method ${this.name} as it has already been replaced by a thunk`);
            break;
          default:
            throw e;
        }
      }
    }
    /** Creates a generic instance of the current generic method. */
    inflate(...classes) {
      if (!this.isGeneric || this.generics.length != classes.length) {
        for (const method of this.overloads()) {
          if (method.isGeneric && method.generics.length == classes.length) {
            return method.inflate(...classes);
          }
        }
        raise(`could not find inflatable signature of method ${this.name} with ${classes.length} generic parameter(s)`);
      }
      const types = classes.map((_) => _.type.object);
      const typeArray = Il2Cpp3.array(Il2Cpp3.corlib.class("System.Type"), types);
      const inflatedMethodObject = this.object.method("MakeGenericMethod", 1).invoke(typeArray);
      return new Il2Cpp3.Method(inflatedMethodObject.field("mhandle").value);
    }
    /** Invokes this method. */
    invoke(...parameters) {
      if (!this.isStatic) {
        raise(`cannot invoke non-static method ${this.name} as it must be invoked throught a Il2Cpp.Object, not a Il2Cpp.Class`);
      }
      return this.invokeRaw(NULL, ...parameters);
    }
    /** @internal */
    invokeRaw(instance, ...parameters) {
      const allocatedParameters = parameters.map(Il2Cpp3.toFridaValue);
      if (!this.isStatic || Il2Cpp3.unityVersionIsBelow201830) {
        allocatedParameters.unshift(instance);
      }
      if (this.isInflated) {
        allocatedParameters.push(this.handle);
      }
      try {
        const returnValue = this.nativeFunction(...allocatedParameters);
        return Il2Cpp3.fromFridaValue(returnValue, this.returnType);
      } catch (e) {
        if (e == null) {
          raise("an unexpected native invocation exception occurred, this is due to parameter types mismatch");
        }
        switch (e.message) {
          case "bad argument count":
            raise(`couldn't invoke method ${this.name} as it needs ${this.parameterCount} parameter(s), not ${parameters.length}`);
          case "expected a pointer":
          case "expected number":
          case "expected array with fields":
            raise(`couldn't invoke method ${this.name} using incorrect parameter types`);
        }
        throw e;
      }
    }
    /** Gets the overloaded method with the given parameter types. */
    overload(...typeNamesOrClasses) {
      const method = this.tryOverload(...typeNamesOrClasses);
      return method ?? raise(`couldn't find overloaded method ${this.name}(${typeNamesOrClasses.map((_) => _ instanceof Il2Cpp3.Class ? _.type.name : _)})`);
    }
    /** @internal */
    *overloads() {
      for (const klass of this.class.hierarchy()) {
        for (const method of klass.methods) {
          if (this.name == method.name) {
            yield method;
          }
        }
      }
    }
    /** Gets the parameter with the given name. */
    parameter(name) {
      return this.tryParameter(name) ?? raise(`couldn't find parameter ${name} in method ${this.name}`);
    }
    /** Restore the original method implementation. */
    revert() {
      Interceptor.revert(this.virtualAddress);
      Interceptor.flush();
    }
    /** Gets the overloaded method with the given parameter types. */
    tryOverload(...typeNamesOrClasses) {
      const minScore = typeNamesOrClasses.length * 1;
      const maxScore = typeNamesOrClasses.length * 2;
      let candidate = void 0;
      loop: for (const method of this.overloads()) {
        if (method.parameterCount != typeNamesOrClasses.length)
          continue;
        let score = 0;
        let i = 0;
        for (const parameter of method.parameters) {
          const desiredTypeNameOrClass = typeNamesOrClasses[i];
          if (desiredTypeNameOrClass instanceof Il2Cpp3.Class) {
            if (parameter.type.is(desiredTypeNameOrClass.type)) {
              score += 2;
            } else if (parameter.type.class.isAssignableFrom(desiredTypeNameOrClass)) {
              score += 1;
            } else {
              continue loop;
            }
          } else if (parameter.type.name == desiredTypeNameOrClass) {
            score += 2;
          } else {
            continue loop;
          }
          i++;
        }
        if (score < minScore) {
          continue;
        } else if (score == maxScore) {
          return method;
        } else if (candidate == void 0 || score > candidate[0]) {
          candidate = [score, method];
        } else if (score == candidate[0]) {
          let i2 = 0;
          for (const parameter of candidate[1].parameters) {
            if (parameter.type.class.isAssignableFrom(method.parameters[i2].type.class)) {
              candidate = [score, method];
              continue loop;
            }
            i2++;
          }
        }
      }
      return candidate?.[1];
    }
    /** Gets the parameter with the given name. */
    tryParameter(name) {
      return this.parameters.find((_) => _.name == name);
    }
    /** */
    toString() {
      return `${this.isStatic ? `static ` : ``}${this.returnType.name} ${this.name}${this.generics.length > 0 ? `<${this.generics.map((_) => _.type.name).join(",")}>` : ""}(${this.parameters.join(`, `)});${this.virtualAddress.isNull() ? `` : ` // 0x${this.relativeVirtualAddress.toString(16).padStart(8, `0`)}`}`;
    }
    /**
     * @internal
     * Binds the current method to a {@link Il2Cpp.Object} or a
     * {@link Il2Cpp.ValueType} (also known as *instances*), so that it is
     * possible to invoke it - see {@link Il2Cpp.Method.invoke} for
     * details. \
     * Binding a static method is forbidden.
     */
    bind(instance) {
      if (this.isStatic) {
        raise(`cannot bind static method ${this.class.type.name}::${this.name} to an instance`);
      }
      return new Proxy(this, {
        get(target, property, receiver) {
          switch (property) {
            case "invoke":
              const handle = instance instanceof Il2Cpp3.ValueType ? target.class.isValueType ? instance.handle.sub(structMethodsRequireObjectInstances() ? Il2Cpp3.Object.headerSize : 0) : raise(`cannot invoke method ${target.class.type.name}::${target.name} against a value type, you must box it first`) : target.class.isValueType ? instance.handle.add(structMethodsRequireObjectInstances() ? 0 : Il2Cpp3.Object.headerSize) : instance.handle;
              return target.invokeRaw.bind(target, handle);
            case "overloads":
              return function* () {
                for (const method of target[property]()) {
                  if (!method.isStatic) {
                    yield method;
                  }
                }
              };
            case "inflate":
            case "overload":
            case "tryOverload":
              const member = Reflect.get(target, property).bind(receiver);
              return function(...args) {
                return member(...args)?.bind(instance);
              };
          }
          return Reflect.get(target, property);
        }
      });
    }
    /** @internal */
    wrap(block) {
      const startIndex = +!this.isStatic | +Il2Cpp3.unityVersionIsBelow201830;
      return new NativeCallback((...args) => {
        const thisObject = this.isStatic ? this.class : this.class.isValueType ? new Il2Cpp3.ValueType(args[0].add(structMethodsRequireObjectInstances() ? Il2Cpp3.Object.headerSize : 0), this.class.type) : new Il2Cpp3.Object(args[0]);
        const parameters = this.parameters.map((_, i) => Il2Cpp3.fromFridaValue(args[i + startIndex], _.type));
        const result = block.call(thisObject, ...parameters);
        return Il2Cpp3.toFridaValue(result);
      }, this.returnType.fridaAlias, this.fridaSignature);
    }
  }
  __decorate([
    lazy
  ], Method.prototype, "class", null);
  __decorate([
    lazy
  ], Method.prototype, "flags", null);
  __decorate([
    lazy
  ], Method.prototype, "implementationFlags", null);
  __decorate([
    lazy
  ], Method.prototype, "fridaSignature", null);
  __decorate([
    lazy
  ], Method.prototype, "generics", null);
  __decorate([
    lazy
  ], Method.prototype, "isExternal", null);
  __decorate([
    lazy
  ], Method.prototype, "isGeneric", null);
  __decorate([
    lazy
  ], Method.prototype, "isInflated", null);
  __decorate([
    lazy
  ], Method.prototype, "isStatic", null);
  __decorate([
    lazy
  ], Method.prototype, "isSynchronized", null);
  __decorate([
    lazy
  ], Method.prototype, "modifier", null);
  __decorate([
    lazy
  ], Method.prototype, "name", null);
  __decorate([
    lazy
  ], Method.prototype, "nativeFunction", null);
  __decorate([
    lazy
  ], Method.prototype, "object", null);
  __decorate([
    lazy
  ], Method.prototype, "parameterCount", null);
  __decorate([
    lazy
  ], Method.prototype, "parameters", null);
  __decorate([
    lazy
  ], Method.prototype, "relativeVirtualAddress", null);
  __decorate([
    lazy
  ], Method.prototype, "returnType", null);
  Il2Cpp3.Method = Method;
  let structMethodsRequireObjectInstances = () => {
    const object = Il2Cpp3.corlib.class("System.Int64").alloc();
    object.field("m_value").value = 3735928559;
    const result = object.method("Equals", 1).overload(object.class).invokeRaw(object, 3735928559);
    return (structMethodsRequireObjectInstances = () => result)();
  };
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Object2 extends NativeStruct {
    /** Gets the Il2CppObject struct size, possibly equal to `Process.pointerSize * 2`. */
    static get headerSize() {
      return Il2Cpp3.corlib.class("System.Object").instanceSize;
    }
    /**
     * Returns the same object, but having its parent class as class.
     * It basically is the C# `base` keyword, so that parent members can be
     * accessed.
     *
     * **Example** \
     * Consider the following classes:
     * ```csharp
     * class Foo
     * {
     *     int foo()
     *     {
     *          return 1;
     *     }
     * }
     * class Bar : Foo
     * {
     *     new int foo()
     *     {
     *          return 2;
     *     }
     * }
     * ```
     * then:
     * ```ts
     * const Bar: Il2Cpp.Class = ...;
     * const bar = Bar.new();
     *
     * console.log(bar.foo()); // 2
     * console.log(bar.base.foo()); // 1
     * ```
     */
    get base() {
      if (this.class.parent == null) {
        raise(`class ${this.class.type.name} has no parent`);
      }
      return new Proxy(this, {
        get(target, property, receiver) {
          if (property == "class") {
            return Reflect.get(target, property).parent;
          } else if (property == "base") {
            return Reflect.getOwnPropertyDescriptor(Il2Cpp3.Object.prototype, property).get.bind(receiver)();
          }
          return Reflect.get(target, property);
        }
      });
    }
    /** Gets the class of this object. */
    get class() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.objectGetClass(this));
    }
    /** Returns a monitor for this object. */
    get monitor() {
      return new Il2Cpp3.Object.Monitor(this);
    }
    /** Gets the size of the current object. */
    get size() {
      return Il2Cpp3.exports.objectGetSize(this);
    }
    /** Gets the non-static field with the given name of the current class hierarchy. */
    field(name) {
      return this.tryField(name) ?? raise(`couldn't find non-static field ${name} in hierarchy of class ${this.class.type.name}`);
    }
    /** Gets the non-static method with the given name (and optionally parameter count) of the current class hierarchy. */
    method(name, parameterCount = -1) {
      return this.tryMethod(name, parameterCount) ?? raise(`couldn't find non-static method ${name} in hierarchy of class ${this.class.type.name}`);
    }
    /** Creates a reference to this object. */
    ref(pin) {
      return new Il2Cpp3.GCHandle(Il2Cpp3.exports.gcHandleNew(this, +pin));
    }
    /** Gets the correct virtual method from the given virtual method. */
    virtualMethod(method) {
      return new Il2Cpp3.Method(Il2Cpp3.exports.objectGetVirtualMethod(this, method)).bind(this);
    }
    /** Gets the non-static field with the given name of the current class hierarchy, if it exists. */
    tryField(name) {
      const field = this.class.tryField(name);
      if (field?.isStatic) {
        for (const klass of this.class.hierarchy({ includeCurrent: false })) {
          for (const field2 of klass.fields) {
            if (field2.name == name && !field2.isStatic) {
              return field2.bind(this);
            }
          }
        }
        return void 0;
      }
      return field?.bind(this);
    }
    /** Gets the non-static method with the given name (and optionally parameter count) of the current class hierarchy, if it exists. */
    tryMethod(name, parameterCount = -1) {
      const method = this.class.tryMethod(name, parameterCount);
      if (method?.isStatic) {
        for (const klass of this.class.hierarchy()) {
          for (const method2 of klass.methods) {
            if (method2.name == name && !method2.isStatic && (parameterCount < 0 || method2.parameterCount == parameterCount)) {
              return method2.bind(this);
            }
          }
        }
        return void 0;
      }
      return method?.bind(this);
    }
    /** */
    toString() {
      return this.isNull() ? "null" : this.method("ToString", 0).invoke().content ?? "null";
    }
    /** Unboxes the value type (either a primitive, a struct or an enum) out of this object. */
    unbox() {
      return this.class.isValueType ? new Il2Cpp3.ValueType(Il2Cpp3.exports.objectUnbox(this), this.class.type) : raise(`couldn't unbox instances of ${this.class.type.name} as they are not value types`);
    }
    /** Creates a weak reference to this object. */
    weakRef(trackResurrection) {
      return new Il2Cpp3.GCHandle(Il2Cpp3.exports.gcHandleNewWeakRef(this, +trackResurrection));
    }
  }
  __decorate([
    lazy
  ], Object2.prototype, "class", null);
  __decorate([
    lazy
  ], Object2.prototype, "size", null);
  __decorate([
    lazy
  ], Object2, "headerSize", null);
  Il2Cpp3.Object = Object2;
  (function(Object3) {
    class Monitor {
      handle;
      /** @internal */
      constructor(handle) {
        this.handle = handle;
      }
      /** Acquires an exclusive lock on the current object. */
      enter() {
        return Il2Cpp3.exports.monitorEnter(this.handle);
      }
      /** Release an exclusive lock on the current object. */
      exit() {
        return Il2Cpp3.exports.monitorExit(this.handle);
      }
      /** Notifies a thread in the waiting queue of a change in the locked object's state. */
      pulse() {
        return Il2Cpp3.exports.monitorPulse(this.handle);
      }
      /** Notifies all waiting threads of a change in the object's state. */
      pulseAll() {
        return Il2Cpp3.exports.monitorPulseAll(this.handle);
      }
      /** Attempts to acquire an exclusive lock on the current object. */
      tryEnter(timeout) {
        return !!Il2Cpp3.exports.monitorTryEnter(this.handle, timeout);
      }
      /** Releases the lock on an object and attempts to block the current thread until it reacquires the lock. */
      tryWait(timeout) {
        return !!Il2Cpp3.exports.monitorTryWait(this.handle, timeout);
      }
      /** Releases the lock on an object and blocks the current thread until it reacquires the lock. */
      wait() {
        return Il2Cpp3.exports.monitorWait(this.handle);
      }
    }
    Object3.Monitor = Monitor;
  })(Object2 = Il2Cpp3.Object || (Il2Cpp3.Object = {}));
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Parameter {
    /** Name of this parameter. */
    name;
    /** Position of this parameter. */
    position;
    /** Type of this parameter. */
    type;
    constructor(name, position, type) {
      this.name = name;
      this.position = position;
      this.type = type;
    }
    /** */
    toString() {
      return `${this.type.name} ${this.name}`;
    }
  }
  Il2Cpp3.Parameter = Parameter;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Pointer extends NativeStruct {
    type;
    constructor(handle, type) {
      super(handle);
      this.type = type;
    }
    /** Gets the element at the given index. */
    get(index) {
      return Il2Cpp3.read(this.handle.add(index * this.type.class.arrayElementSize), this.type);
    }
    /** Reads the given amount of elements starting at the given offset. */
    read(length, offset = 0) {
      const values = new globalThis.Array(length);
      for (let i = 0; i < length; i++) {
        values[i] = this.get(i + offset);
      }
      return values;
    }
    /** Sets the given element at the given index */
    set(index, value) {
      Il2Cpp3.write(this.handle.add(index * this.type.class.arrayElementSize), value, this.type);
    }
    /** */
    toString() {
      return this.handle.toString();
    }
    /** Writes the given elements starting at the given index. */
    write(values, offset = 0) {
      for (let i = 0; i < values.length; i++) {
        this.set(i + offset, values[i]);
      }
    }
  }
  Il2Cpp3.Pointer = Pointer;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Reference extends NativeStruct {
    type;
    constructor(handle, type) {
      super(handle);
      this.type = type;
    }
    /** Gets the element referenced by the current reference. */
    get value() {
      return Il2Cpp3.read(this.handle, this.type);
    }
    /** Sets the element referenced by the current reference. */
    set value(value) {
      Il2Cpp3.write(this.handle, value, this.type);
    }
    /** */
    toString() {
      return this.isNull() ? "null" : `->${this.value}`;
    }
  }
  Il2Cpp3.Reference = Reference;
  function reference(value, type) {
    const handle = Memory.alloc(Process.pointerSize);
    switch (typeof value) {
      case "boolean":
        return new Il2Cpp3.Reference(handle.writeS8(+value), Il2Cpp3.corlib.class("System.Boolean").type);
      case "number":
        switch (type?.enumValue) {
          case Il2Cpp3.Type.Enum.UBYTE:
            return new Il2Cpp3.Reference(handle.writeU8(value), type);
          case Il2Cpp3.Type.Enum.BYTE:
            return new Il2Cpp3.Reference(handle.writeS8(value), type);
          case Il2Cpp3.Type.Enum.CHAR:
          case Il2Cpp3.Type.Enum.USHORT:
            return new Il2Cpp3.Reference(handle.writeU16(value), type);
          case Il2Cpp3.Type.Enum.SHORT:
            return new Il2Cpp3.Reference(handle.writeS16(value), type);
          case Il2Cpp3.Type.Enum.UINT:
            return new Il2Cpp3.Reference(handle.writeU32(value), type);
          case Il2Cpp3.Type.Enum.INT:
            return new Il2Cpp3.Reference(handle.writeS32(value), type);
          case Il2Cpp3.Type.Enum.ULONG:
            return new Il2Cpp3.Reference(handle.writeU64(value), type);
          case Il2Cpp3.Type.Enum.LONG:
            return new Il2Cpp3.Reference(handle.writeS64(value), type);
          case Il2Cpp3.Type.Enum.FLOAT:
            return new Il2Cpp3.Reference(handle.writeFloat(value), type);
          case Il2Cpp3.Type.Enum.DOUBLE:
            return new Il2Cpp3.Reference(handle.writeDouble(value), type);
        }
      case "object":
        if (value instanceof Il2Cpp3.ValueType || value instanceof Il2Cpp3.Pointer) {
          return new Il2Cpp3.Reference(value.handle, value.type);
        } else if (value instanceof Il2Cpp3.Object) {
          return new Il2Cpp3.Reference(handle.writePointer(value), value.class.type);
        } else if (value instanceof Il2Cpp3.String || value instanceof Il2Cpp3.Array) {
          return new Il2Cpp3.Reference(handle.writePointer(value), value.object.class.type);
        } else if (value instanceof NativePointer) {
          switch (type?.enumValue) {
            case Il2Cpp3.Type.Enum.NUINT:
            case Il2Cpp3.Type.Enum.NINT:
              return new Il2Cpp3.Reference(handle.writePointer(value), type);
          }
        } else if (value instanceof Int64) {
          return new Il2Cpp3.Reference(handle.writeS64(value), Il2Cpp3.corlib.class("System.Int64").type);
        } else if (value instanceof UInt64) {
          return new Il2Cpp3.Reference(handle.writeU64(value), Il2Cpp3.corlib.class("System.UInt64").type);
        }
      default:
        raise(`couldn't create a reference to ${value} using an unhandled type ${type?.name}`);
    }
  }
  Il2Cpp3.reference = reference;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class String extends NativeStruct {
    /** Gets the content of this string. */
    get content() {
      return Il2Cpp3.exports.stringGetChars(this).readUtf16String(this.length);
    }
    /** @unsafe Sets the content of this string - it may write out of bounds! */
    set content(value) {
      const offset = Il2Cpp3.string("vfsfitvnm").handle.offsetOf((_) => _.readInt() == 9) ?? raise("couldn't find the length offset in the native string struct");
      globalThis.Object.defineProperty(Il2Cpp3.String.prototype, "content", {
        set(value2) {
          Il2Cpp3.exports.stringGetChars(this).writeUtf16String(value2 ?? "");
          this.handle.add(offset).writeS32(value2?.length ?? 0);
        }
      });
      this.content = value;
    }
    /** Gets the length of this string. */
    get length() {
      return Il2Cpp3.exports.stringGetLength(this);
    }
    /** Gets the encompassing object of the current string. */
    get object() {
      return new Il2Cpp3.Object(this);
    }
    /** */
    toString() {
      return this.isNull() ? "null" : `"${this.content}"`;
    }
  }
  Il2Cpp3.String = String;
  function string(content) {
    return new Il2Cpp3.String(Il2Cpp3.exports.stringNew(Memory.allocUtf8String(content ?? "")));
  }
  Il2Cpp3.string = string;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Thread extends NativeStruct {
    /** Gets the native id of the current thread. */
    get id() {
      let get = function() {
        return this.internal.field("thread_id").value.toNumber();
      };
      if (Process.platform != "windows") {
        const currentThreadId = Process.getCurrentThreadId();
        const currentPosixThread = ptr(get.apply(Il2Cpp3.currentThread));
        const offset = currentPosixThread.offsetOf((_) => _.readS32() == currentThreadId, 1024) ?? raise(`couldn't find the offset for determining the kernel id of a posix thread`);
        const _get = get;
        get = function() {
          return ptr(_get.apply(this)).add(offset).readS32();
        };
      }
      getter(Il2Cpp3.Thread.prototype, "id", get, lazy);
      return this.id;
    }
    /** Gets the encompassing internal object (System.Threding.InternalThreead) of the current thread. */
    get internal() {
      return this.object.tryField("internal_thread")?.value ?? this.object;
    }
    /** Determines whether the current thread is the garbage collector finalizer one. */
    get isFinalizer() {
      return !Il2Cpp3.exports.threadIsVm(this);
    }
    /** Gets the managed id of the current thread. */
    get managedId() {
      return this.object.method("get_ManagedThreadId").invoke();
    }
    /** Gets the encompassing object of the current thread. */
    get object() {
      return new Il2Cpp3.Object(this);
    }
    /** @internal */
    get staticData() {
      return this.internal.field("static_data").value;
    }
    /** @internal */
    get synchronizationContext() {
      const get_ExecutionContext = this.object.tryMethod("GetMutableExecutionContext") ?? this.object.method("get_ExecutionContext");
      const executionContext = get_ExecutionContext.invoke();
      const synchronizationContext = executionContext.tryField("_syncContext")?.value ?? executionContext.tryMethod("get_SynchronizationContext")?.invoke() ?? this.tryLocalValue(Il2Cpp3.corlib.class("System.Threading.SynchronizationContext"));
      return synchronizationContext?.asNullable() ?? null;
    }
    /** Detaches the thread from the application domain. */
    detach() {
      return Il2Cpp3.exports.threadDetach(this);
    }
    /** Schedules a callback on the current thread. */
    schedule(block) {
      const Post = this.synchronizationContext?.tryMethod("Post");
      if (Post == null) {
        return Process.runOnThread(this.id, block);
      }
      return new Promise((resolve) => {
        const delegate = Il2Cpp3.delegate(Il2Cpp3.corlib.class("System.Threading.SendOrPostCallback"), () => {
          const result = block();
          setImmediate(() => resolve(result));
        });
        Script.bindWeak(globalThis, () => {
          delegate.field("method_ptr").value = delegate.field("invoke_impl").value = Il2Cpp3.exports.domainGet;
        });
        Post.invoke(delegate, NULL);
      });
    }
    /** @internal */
    tryLocalValue(klass) {
      for (let i = 0; i < 16; i++) {
        const base = this.staticData.add(i * Process.pointerSize).readPointer();
        if (!base.isNull()) {
          const object = new Il2Cpp3.Object(base.readPointer()).asNullable();
          if (object?.class?.isSubclassOf(klass, false)) {
            return object;
          }
        }
      }
    }
  }
  __decorate([
    lazy
  ], Thread.prototype, "internal", null);
  __decorate([
    lazy
  ], Thread.prototype, "isFinalizer", null);
  __decorate([
    lazy
  ], Thread.prototype, "managedId", null);
  __decorate([
    lazy
  ], Thread.prototype, "object", null);
  __decorate([
    lazy
  ], Thread.prototype, "staticData", null);
  __decorate([
    lazy
  ], Thread.prototype, "synchronizationContext", null);
  Il2Cpp3.Thread = Thread;
  getter(Il2Cpp3, "attachedThreads", () => {
    if (Il2Cpp3.exports.threadGetAttachedThreads.isNull()) {
      const currentThreadHandle = Il2Cpp3.currentThread?.handle ?? raise("Current thread is not attached to IL2CPP");
      const pattern = currentThreadHandle.toMatchPattern();
      const threads = [];
      for (const range of Process.enumerateRanges("rw-")) {
        if (range.file == void 0) {
          const matches = Memory.scanSync(range.base, range.size, pattern);
          if (matches.length == 1) {
            while (true) {
              const handle = matches[0].address.sub(matches[0].size * threads.length).readPointer();
              if (handle.isNull() || !handle.readPointer().equals(currentThreadHandle.readPointer())) {
                break;
              }
              threads.unshift(new Il2Cpp3.Thread(handle));
            }
            break;
          }
        }
      }
      return threads;
    }
    return readNativeList(Il2Cpp3.exports.threadGetAttachedThreads).map((_) => new Il2Cpp3.Thread(_));
  });
  getter(Il2Cpp3, "currentThread", () => {
    return new Il2Cpp3.Thread(Il2Cpp3.exports.threadGetCurrent()).asNullable();
  });
  getter(Il2Cpp3, "mainThread", () => {
    return Il2Cpp3.attachedThreads[0];
  });
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  let Type = class Type extends NativeStruct {
    /** */
    static get Enum() {
      const _ = (_2, block = (_3) => _3) => block(Il2Cpp3.corlib.class(_2)).type.enumValue;
      const initial = {
        VOID: _("System.Void"),
        BOOLEAN: _("System.Boolean"),
        CHAR: _("System.Char"),
        BYTE: _("System.SByte"),
        UBYTE: _("System.Byte"),
        SHORT: _("System.Int16"),
        USHORT: _("System.UInt16"),
        INT: _("System.Int32"),
        UINT: _("System.UInt32"),
        LONG: _("System.Int64"),
        ULONG: _("System.UInt64"),
        NINT: _("System.IntPtr"),
        NUINT: _("System.UIntPtr"),
        FLOAT: _("System.Single"),
        DOUBLE: _("System.Double"),
        POINTER: _("System.IntPtr", (_2) => _2.field("m_value")),
        VALUE_TYPE: _("System.Decimal"),
        OBJECT: _("System.Object"),
        STRING: _("System.String"),
        CLASS: _("System.Array"),
        ARRAY: _("System.Void", (_2) => _2.arrayClass),
        NARRAY: _("System.Void", (_2) => new Il2Cpp3.Class(Il2Cpp3.exports.classGetArrayClass(_2, 2))),
        GENERIC_INSTANCE: _("System.Int32", (_2) => _2.interfaces.find((_3) => _3.name.endsWith("`1")))
      };
      Reflect.defineProperty(this, "Enum", { value: initial });
      return addFlippedEntries({
        ...initial,
        VAR: _("System.Action`1", (_2) => _2.generics[0]),
        MVAR: _("System.Array", (_2) => _2.method("AsReadOnly", 1).generics[0])
      });
    }
    /** Gets the class of this type. */
    get class() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.typeGetClass(this));
    }
    /** */
    get fridaAlias() {
      function getValueTypeFields(type) {
        const instanceFields = type.class.fields.filter((_) => !_.isStatic);
        return instanceFields.length == 0 ? ["char"] : instanceFields.map((_) => _.type.fridaAlias);
      }
      if (this.isByReference) {
        return "pointer";
      }
      switch (this.enumValue) {
        case Il2Cpp3.Type.Enum.VOID:
          return "void";
        case Il2Cpp3.Type.Enum.BOOLEAN:
          return "bool";
        case Il2Cpp3.Type.Enum.CHAR:
          return "uchar";
        case Il2Cpp3.Type.Enum.BYTE:
          return "int8";
        case Il2Cpp3.Type.Enum.UBYTE:
          return "uint8";
        case Il2Cpp3.Type.Enum.SHORT:
          return "int16";
        case Il2Cpp3.Type.Enum.USHORT:
          return "uint16";
        case Il2Cpp3.Type.Enum.INT:
          return "int32";
        case Il2Cpp3.Type.Enum.UINT:
          return "uint32";
        case Il2Cpp3.Type.Enum.LONG:
          return "int64";
        case Il2Cpp3.Type.Enum.ULONG:
          return "uint64";
        case Il2Cpp3.Type.Enum.FLOAT:
          return "float";
        case Il2Cpp3.Type.Enum.DOUBLE:
          return "double";
        case Il2Cpp3.Type.Enum.NINT:
        case Il2Cpp3.Type.Enum.NUINT:
        case Il2Cpp3.Type.Enum.POINTER:
        case Il2Cpp3.Type.Enum.STRING:
        case Il2Cpp3.Type.Enum.ARRAY:
        case Il2Cpp3.Type.Enum.NARRAY:
          return "pointer";
        case Il2Cpp3.Type.Enum.VALUE_TYPE:
          return this.class.isEnum ? this.class.baseType.fridaAlias : getValueTypeFields(this);
        case Il2Cpp3.Type.Enum.CLASS:
        case Il2Cpp3.Type.Enum.OBJECT:
        case Il2Cpp3.Type.Enum.GENERIC_INSTANCE:
          return this.class.isStruct ? getValueTypeFields(this) : this.class.isEnum ? this.class.baseType.fridaAlias : "pointer";
        default:
          return "pointer";
      }
    }
    /** Determines whether this type is passed by reference. */
    get isByReference() {
      return this.name.endsWith("&");
    }
    /** Determines whether this type is primitive. */
    get isPrimitive() {
      switch (this.enumValue) {
        case Il2Cpp3.Type.Enum.BOOLEAN:
        case Il2Cpp3.Type.Enum.CHAR:
        case Il2Cpp3.Type.Enum.BYTE:
        case Il2Cpp3.Type.Enum.UBYTE:
        case Il2Cpp3.Type.Enum.SHORT:
        case Il2Cpp3.Type.Enum.USHORT:
        case Il2Cpp3.Type.Enum.INT:
        case Il2Cpp3.Type.Enum.UINT:
        case Il2Cpp3.Type.Enum.LONG:
        case Il2Cpp3.Type.Enum.ULONG:
        case Il2Cpp3.Type.Enum.FLOAT:
        case Il2Cpp3.Type.Enum.DOUBLE:
        case Il2Cpp3.Type.Enum.NINT:
        case Il2Cpp3.Type.Enum.NUINT:
          return true;
        default:
          return false;
      }
    }
    /** Gets the name of this type. */
    get name() {
      const handle = Il2Cpp3.exports.typeGetName(this);
      try {
        return handle.readUtf8String();
      } finally {
        Il2Cpp3.free(handle);
      }
    }
    /** Gets the encompassing object of the current type. */
    get object() {
      return new Il2Cpp3.Object(Il2Cpp3.exports.typeGetObject(this));
    }
    /** Gets the {@link Il2Cpp.Type.Enum} value of the current type. */
    get enumValue() {
      return Il2Cpp3.exports.typeGetTypeEnum(this);
    }
    is(other) {
      if (Il2Cpp3.exports.typeEquals.isNull()) {
        return this.object.method("Equals").invoke(other.object);
      }
      return !!Il2Cpp3.exports.typeEquals(this, other);
    }
    /** */
    toString() {
      return this.name;
    }
  };
  __decorate([
    lazy
  ], Type.prototype, "class", null);
  __decorate([
    lazy
  ], Type.prototype, "fridaAlias", null);
  __decorate([
    lazy
  ], Type.prototype, "isByReference", null);
  __decorate([
    lazy
  ], Type.prototype, "isPrimitive", null);
  __decorate([
    lazy
  ], Type.prototype, "name", null);
  __decorate([
    lazy
  ], Type.prototype, "object", null);
  __decorate([
    lazy
  ], Type.prototype, "enumValue", null);
  __decorate([
    lazy
  ], Type, "Enum", null);
  Type = __decorate([
    recycle
  ], Type);
  Il2Cpp3.Type = Type;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class ValueType extends NativeStruct {
    type;
    constructor(handle, type) {
      super(handle);
      this.type = type;
    }
    /** Boxes the current value type in a object. */
    box() {
      return new Il2Cpp3.Object(Il2Cpp3.exports.valueTypeBox(this.type.class, this));
    }
    /** Gets the non-static field with the given name of the current class hierarchy. */
    field(name) {
      return this.tryField(name) ?? raise(`couldn't find non-static field ${name} in hierarchy of class ${this.type.name}`);
    }
    /** Gets the non-static method with the given name (and optionally parameter count) of the current class hierarchy. */
    method(name, parameterCount = -1) {
      return this.tryMethod(name, parameterCount) ?? raise(`couldn't find non-static method ${name} in hierarchy of class ${this.type.name}`);
    }
    /** Gets the non-static field with the given name of the current class hierarchy, if it exists. */
    tryField(name) {
      const field = this.type.class.tryField(name);
      if (field?.isStatic) {
        for (const klass of this.type.class.hierarchy()) {
          for (const field2 of klass.fields) {
            if (field2.name == name && !field2.isStatic) {
              return field2.bind(this);
            }
          }
        }
        return void 0;
      }
      return field?.bind(this);
    }
    /** Gets the non-static method with the given name (and optionally parameter count) of the current class hierarchy, if it exists. */
    tryMethod(name, parameterCount = -1) {
      const method = this.type.class.tryMethod(name, parameterCount);
      if (method?.isStatic) {
        for (const klass of this.type.class.hierarchy()) {
          for (const method2 of klass.methods) {
            if (method2.name == name && !method2.isStatic && (parameterCount < 0 || method2.parameterCount == parameterCount)) {
              return method2.bind(this);
            }
          }
        }
        return void 0;
      }
      return method?.bind(this);
    }
    /** */
    toString() {
      const ToString = this.method("ToString", 0);
      return this.isNull() ? "null" : (
        // If ToString is defined within a value type class, we can
        // avoid a boxing operation.
        ToString.class.isValueType ? ToString.invoke().content ?? "null" : this.box().toString() ?? "null"
      );
    }
  }
  Il2Cpp3.ValueType = ValueType;
})(Il2Cpp2 || (Il2Cpp2 = {}));
globalThis.Il2Cpp = Il2Cpp2;

// src/util.ts
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function getActivity(activityName) {
  let activity;
  Java.choose(activityName, {
    onMatch: (obj) => {
      activity = obj;
    },
    onComplete: () => {
    }
  });
  return activity;
}
async function ensureModulesInitialized(...modules2) {
  while (modules2.length > 0) {
    const md = modules2.pop();
    if (!md)
      return;
    try {
      Process.getModuleByName(md);
    } catch (e) {
      await sleep(100);
      modules2.push(md);
      continue;
    }
  }
}
function JavaIl2CppPerform(fn) {
  Java.perform(() => Il2Cpp.perform(fn));
}

// src/index.ts
var APP_MAIN_ACTIVITY = "com.unity3d.player.UnityPlayerActivity";
var modules = ["libil2cpp.so"];
var ESP_REFRESH_RATE = 0;
JavaIl2CppPerform(async () => {
  await getActivity(APP_MAIN_ACTIVITY);
  await ensureModulesInitialized(...modules);
  const dexBase64 = "ZGV4CjAzNQCsX2h3vRqb0Q0jsKNkC7s/3r7EJYOvNxKUkQEAcAAAAHhWNBIAAAAAAAAAANCQAQBiAgAAcAAAAIIAAAD4CQAAgQAAAAAMAAB6AAAADBIAAFgBAADcFQAAIQAAAJwgAADYbAEAvCQAAAhdAAAOXQAAFF0AAB9dAAAoXQAAM10AADxdAABFXQAATl0AAFddAABgXQAAa10AAHRdAAB+XQAAiF0AAIxdAACRXQAAlV0AAKZdAACvXQAA/l4AAAZfAAANXwAANl8AAF9fAABxXwAAgl8AAIpfAACUXwAAnl8AAKhfAAC2XwAAwl8AAM9fAADXXwAA518AAO5fAAABYAAACWAAABNgAAAfYAAAKWAAADVgAABBYAAATmAAAFhgAABkYAAAcWAAAIVgAACRYAAAo2AAALNgAAC9YAAAx2AAANFgAADfYAAA72AAAP1gAAAUYQAAF2EAAB1hAAAjYQAAK2EAADBhAAA6YQAAR2EAAEphAABOYQAAVGEAAFhhAABdYQAAY2EAAHVhAAB/YQAAi2EAAJZhAACjYQAAs2EAALZhAAC7YQAAHGIAAB9iAAAjYgAAJ2IAACxiAAAyYgAAN2IAAD1iAABBYgAAZGIAAH9iAACaYgAAzWIAAPBiAAAKYwAAMGMAAFFjAABsYwAAjmMAAKljAADDYwAA42MAAANkAAAdZAAAN2QAAFtkAAB4ZAAAnmQAAMxkAADfZAAA+2QAABBlAAAmZQAAP2UAAFRlAABsZQAAkWUAAK5lAADFZQAA5GUAAPhlAAATZgAAL2YAAFRmAAB9ZgAAomYAALdmAADeZgAAC2cAADZnAABUZwAAcmcAAIxnAAClZwAAwGcAAPlnAAAaaAAANWgAAFNoAAB5aAAAlWgAAMFoAADgaAAA/mgAABtpAABJaQAAamkAAIdpAAC5aQAA02kAAOxpAAAHagAAH2oAAEtqAABnagAAhGoAAMBqAADiagAAFmsAAEtrAACAawAAtWsAAOprAAAfbAAAVGwAAIlsAAC+bAAA82wAAChtAABcbQAAkW0AAMZtAAD7bQAAL24AAGNuAACXbgAAy24AAP9uAAAzbwAAZ28AAJtvAAC3bwAA4W8AAPtvAAAZcAAAN3AAAFRwAAB4cAAAnXAAAL1wAADgcAAA/3AAABlxAAAwcQAAVnEAAHlxAACOcQAAsHEAAMJxAADlcQAA+XEAAA9yAAAjcgAAPnIAAFJyAABmcgAAhHIAAJZyAACqcgAAv3IAAMhyAADXcgAA7XIAAAVzAAAdcwAAM3MAAEpzAABXcwAAbnMAAIJzAACbcwAAqnMAALZzAADCcwAA1XMAAOJzAADvcwAA+nMAABV0AAAodAAAO3QAAD90AABEdAAASHQAAEx0AABWdAAAYHQAAGp0AACGdAAAlXQAAKR0AACzdAAAwXQAANV0AADldAAA8nQAAPt0AAAKdQAAJHUAAD51AABWdQAAYHUAAGh1AABxdQAAfHUAAId1AACSdQAAuXUAANZ1AADedQAA6HUAAPx1AAASdgAAHHYAACZ2AAA3dgAALncAAEB3AABHdwAASncAAE53AABWdwAAXXcAAGF3AABmdwAAbXcAAHd3AAB8dwAAgHcAAIR3AACLdwAAkHcAAJt3AACndwAAtHcAAMF3AADNdwAA1ncAANx3AADhdwAA53cAAO53AAD2dwAA/3cAAAh4AAAOeAAAFXgAAB54AAAmeAAAL3gAADh4AAA+eAAAQ3gAAEd4AABzeAAAlngAAKN4AACoeAAAAnkAAEB5AABseQAAb3kAAHN5AAB4eQAAf3kAAId5AACLeQAAj3kAAKR5AACpeQAArHkAALh5AADFeQAAzXkAANl5AADieQAA63kAAAd6AAAPegAAH3oAACd6AAAqegAAL3oAADh6AABAegAATHoAAFR6AABcegAAY3oAAG16AAB3egAAjXoAAJd6AAClegAAsnoAALl6AADJegAA0XoAANp6AADuegAA9noAAAN7AAAWewAAG3sAAB57AAAmewAAN3sAAEB7AABIewAAUHsAAFR7AABgewAAa3sAAHV7AAB/ewAAiXsAAIx7AACZewAAoHsAAKx7AACxewAAtnsAALt7AADAewAAxXsAAMp7AADUewAA4XsAAOl7AAD0ewAA+XsAAAN8AAAKfAAAEXwAABR8AAAZfAAAJHwAAC98AAA7fAAAR3wAAFp8AABhfAAAcnwAAH58AACTfAAAnHwAAKV8AACzfAAAvXwAAMp8AADcfAAA5XwAAO98AAABfQAAE30AACJ9AAArfQAAM30AADx9AABRfQAAW30AAGF9AAB9fQAAm30AAJ59AADieAEA83gBAAF5AQAIeQEAEHkBABl5AQAkeQEA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DwEAAHwAAADoWQAAEAEAAHwAAABcWQAAEQEAAHwAAAD0WQAAEgEAAHwAAAD8WQAAEwEAAHwAAAAIWgAAFAEAAHwAAAAcWgAAFQEAAHwAAAAkWgAAFgEAAHwAAAAsWgAAIQEAAHwAAAA0WgAAIAEAAHwAAABAWgAAGAEAAHwAAABIWgAAFgEAAHwAAABQWgAAFgEAAHwAAABYWgAAFgEAAHwAAABgWgAAFgEAAHwAAABoWgAAGQEAAHwAAABwWgAAGgEAAHwAAACEWgAAGwEAAHwAAACcWgAAHAEAAHwAAAC0WgAAHQEAAHwAAADMWgAAFgEAAHwAAADkWgAAFgEAAHwAAADsWgAAGAEAAHwAAAD0WgAAFgEAAHwAAAD8WgAAFgEAAHwAAAAEWwAAFgEAAHwAAAAMWwAAFgEAAHwAAAAoWQAAFgEAAHwAAAAwWQAAFgEAAHwAAABAWQAAFgEAAHwAAACIWQAAIAEAAHwAAAAUWwAAFgEAAHwAAAAcWwAAFgEAAHwAAAA4WQAALQEAAHwAAAAkWwAAFgEAAHwAAAAsWwAAJgEAAHwAAAA0WwAAJwEAAHwAAABAWwAAFgEAAHwAAABIWQAAFgEAAHwAAABMWwAAHwEAAHwAAABUWwAAFgEAAHwAAABgWwAAFgEAAHwAAAC4WQAAJwEAAHwAAABoWwAAIAEAAHwAAAB0WwAAKgEAAHwAAAB8WwAAJAEAAHwAAACMWwAAJQEAAHwAAACcWwAAJwEAAHwAAACsWwAAKQEAAHwAAAC4WwAAJwEAAHwAAADIWwAAKQEAAHwAAADUWwAAIAEAAHwAAADkWwAAFgEAAHwAAADsWwAAIAEAAHwAAAD0WwAAKAEAAHwAAAD8WwAALAEAAHwAAAAMXAAAHgEAAHwAAAAYXAAAKwEAAHwAAAAoXAAAKwEAAHwAAAA4XAAAFgEAAHwAAACQWQAAFgEAAHwAAAAYWQAAIAEAAHwAAABIXAAAFgEAAHwAAABwWQAAFwEAAHwAAABQXAAAIAEAAHwAAABcXAAAIAEAAHwAAABkXAAAIAEAAHwAAABsXAAAIAEAAHwAAAB0XAAAIgEAAHwAAAB8XAAAIwEAAHwAAACIXAAAIAEAAHwAAACYXAAAIAEAAHwAAACgXAAAIAEAAHwAAAB4WQAAJgEAAHwAAACoXAAAIAEAAHwAAAC0XAAAJgEAAHwAAAC8XAAALgEAAHwAAADAWQAAIAEAAHwAAADIXAAANgEAAH0AAAAAAAAAOgEAAH0AAADQXAAANwEAAH0AAACIWQAAOAEAAH0AAADgXAAAOQEAAH0AAADoXAAAOQEAAH0AAAD0XAAAUwAAAH4AAAAAXQAADwAPACEAAAAQABAAPAAAABAAEAD7AAAAEgABAFwCAAASAAEAXgIAABMAEwAjAAAAEwATAPoAAAAYAAEA9QAAAB4AHgDRAAAAIQAAAGQBAAApAAEAlgEAACkAAQBYAgAAKgABAEkCAAArAAEAlQEAACsAAQBcAgAAKwABAF4CAAA1ADUAPQAAAEQAAQAYAAAARAABABkAAABEAAEAIgAAAEQAAQAkAAAARAABANIAAABEAAEA0wAAAEQAAQDUAAAARAB0ANUAAABEAAAA1gAAAEQAAQDXAAAARAABANgAAABEAHQA2QAAAEQAdADaAAAARAABANsAAABEAHQA3AAAAEQAdADdAAAARAABAN4AAABEAAEA5QAAAEQAAQDyAAAARAABAPYAAABEAAEA9wAAAEQAAQD4AAAARAABAPkAAABEAAEABAEAAEQAAQAFAQAARQABAD4AAABFAHgAegEAAEUAEQDLAQAARQARAM4BAABFABEAzwEAAEUAdwDQAQAARQACADUCAABFAHkAQwIAAEYARwBxAQAASABhAHEBAABJAGEAcQEAAEsAYQBxAQAATABhAHEBAABNAHMAcQEAAE4AYQBxAQAATgBjAHIBAABOADMAcwEAAE4ALwB0AQAATgB0AHUBAABQAGEAcQEAAFIAOABxAQAAUgBBAHIBAABSAHQAcwEAAFQAYgBxAQAAVQBhAHEBAABVAGIAcgEAAFUALwBzAQAAVQB0AHQBAABVABYAdQEAAFUAAAB2AQAAVgBhAHEBAABWAGQAcgEAAFYAMwBzAQAAVgAvAHQBAABWAHQAdQEAAFcAYQBxAQAAVwB0AHIBAABYAGIAcQEAAFkAYgBxAQAAWgBhAHEBAABaAGMAcgEAAFoALwBzAQAAWgB0AHQBAABbAGEAcQEAAFsAEgByAQAAWwASAHMBAABbAGEAdAEAAFwAYQBxAQAAXABkAHIBAABcAC8AcwEAAFwAdAB0AQAAXQBhAHEBAABdAGMAcgEAAF0AAQBzAQAAXQBBAHQBAABdAHQAdQEAAF0AgAB2AQAAXgBhAHEBAABfAGEAQgIAAF8AdABOAgAAXwABAE8CAABfAAEAUAIAAF8AQQBRAgAAXwBjAFICAABgAEEAQQIAAGAAYQBCAgAAYQBEAFoBAABhAAUAWwEAAGEAOABeAQAAYQA4AHgBAABhAH0ApQEAAGEANgDBAQAAYQA8AMkBAABhADgAygEAAGEAEgDpAQAAYQAsAFoCAABhACsAWwIAAGIAfQBTAgAAYwABAFMCAABkAHQAUwIAAAMAMwAUAAAAAwAMAF0BAAADAAoAEwIAAAMACwAVAgAAAwALAB0CAAADAAoALAIAAAMACQAwAgAAAwAMADICAAAEACkAMgIAAAUADgCMAQAABQAjAI8BAAAFADcANwIAAAcAKQBPAQAACABsABQAAAAJAHkAFAAAAAkADQBUAgAACgAUAIUBAAAMAA8AYwEAAA0ALABoAQAADQAxAGkBAAANACsAagEAAA0AKwBrAQAADQBrAGwBAAAOAAUA5QEAAA4ABAD0AQAAEQApABQAAAARAC0A/QEAABEAeAD+AQAAEQAtAAMCAAARACoAIgIAABEAQQAjAgAAEQBAACUCAAARACoAJwIAABIALgAUAAAAFQAxAAQCAAAVADgAKwIAABYAKQAUAAAAFgAtAAMCAAAWACoABQIAABcAEQDkAQAAGgAtACgCAAAcABMAfAEAACAAgABiAQAAIgAGAGEBAAAiAAYAbQEAACMAAQBIAQAAJAACAIEBAAAkAAAAigEAACQAAACLAQAAKAA0ABQAAAAoAAIAhgEAACkALgAUAAAAKwAwABQAAAAsAEoARQEAACwASQDyAQAALABKAEsCAAAtAHgABgIAAC4AMwAUAAAALgAYAI4BAAAuAHUAyAEAAC4ALQAAAgAALgAvABwCAAAvADMAFAAAAC8AeAD8AQAALwBDAP8BAAAvAC0AAAIAAC8ALQALAgAALwAtAAwCAAAvAEsADwIAAC8ARgAXAgAALwBHABgCAAAvAGcAJAIAAC8ALQAmAgAAMAAzABQAAAAwADgAAQIAADAATAAWAgAAMABnACQCAAAwAC0AJgIAADMAMwAUAAAAMwASAJABAAAzAC0ADgIAADMAZwAkAgAANAAzABQAAAA2ADMAFAAAADYAFwCHAQAANgA5AA0CAAA2AEsADwIAADYARgAXAgAANgBIABoCAAA2AE4AHwIAADcALgAUAAAANwAvABACAAA4ADMAFAAAADgASQBFAQAAOAACAJQBAAA4AEMA/wEAADgALQAAAgAAOAAtAAoCAAA4AEsADwIAADgALQAbAgAAOAAvABwCAAA4AC0ALwIAADgALQAxAgAAOQAzABQAAAA5ADgAAQIAADkARgAXAgAAOQBnACQCAAA5AC0AJgIAADoAMwAUAAAAOgBJAEUBAAA6AC0AUQEAADoAFgCDAQAAOgAtABsCAAA6AC8AHAIAADsALgAUAAAAOwAtAEQBAAA8ADMAFAAAADwASQBFAQAAPAAqAP0BAAA8AC8AHAIAADwALQAvAgAAPAAtADECAAA9ADMAFAAAAD0ASQBFAQAAPQAtAAACAAA9AEsADwIAAD8AMwAUAAAAPwAQAIkBAAA/ABAAkQEAAD8ALQASAgAAPwAtABQCAAA/AFEAGQIAAD8ALwAcAgAAPwAtAB4CAABAADMAFAAAAEAAEACSAQAAQAAQAJMBAABAAHgAAgIAAEAATAAWAgAAQAAvABwCAABAAGcAJAIAAEAALQAmAgAAQAAtACkCAABAAC0ALQIAAEEAMwAUAAAAQQAhAJABAABBAC0AAAIAAEEARQAHAgAAQQAtAAoCAABBAC0ACwIAAEEALQAMAgAAQQBLAA8CAABBAC0AEQIAAEEARgAXAgAAQQAvABwCAABBAHgAIAIAAEEAeAAhAgAAQQBnACQCAABBAC0AJgIAAEEAKgAnAgAAQQBCAC4CAABCABsA0QEAAEIAKQAyAgAAQwApABQAAABDAEQA2gEAAEQAKQAUAAAARQAzABQAAABFADoAKwAAAEUAPAAwAAAARQA7ADEAAABFADwAMgAAAEUAPQAzAAAARQA+ADQAAABFAD8ANQAAAEUAKQBHAAAARQACAIIBAABFAAIAjQEAAEUAAgCUAQAARQA6ANsBAABFACkA6gEAAEUAKQD2AQAARQAtAAACAABFAC0ACAIAAEUAeAAJAgAARgBUABQAAABGACkA9gEAAEcAKQAUAAAARwApAAYBAABHACkAvwEAAEcARADaAQAASABVABQAAABIADYA2QEAAEkAVQAUAAAASQBJANkBAABKACkAFAAAAEoANgDZAQAASwBVABQAAABLAHwA3AEAAEwAVQAUAAAATABJANkBAABNAGgAFAAAAE0ASQDZAQAATgBcABQAAABOADYA2QEAAE8AKQAUAAAATwA2ANkBAABQAFUAFAAAAFAANgDZAQAAUQApABQAAABRADYA2QEAAFIATwAUAAAAUgBJANkBAABTACkAFAAAAFMANgDZAQAAVABgABQAAABUAE0A2AEAAFUAWAAUAAAAVQBJANkBAABWAF4AFAAAAFYANgDZAQAAVwBfABQAAABXAEkA2QEAAFgAYAAUAAAAWABJANkBAABZAGAAFAAAAFkATQDYAQAAWgBbABQAAABaAHwA3AEAAFsAVgAUAAAAWwB9AOABAABcAF0AFAAAAFwAfADcAQAAXQBaABQAAABdAEkA2QEAAF4AVQAUAAAAXgBJANkBAABfAFkAFAAAAF8AUwDdAQAAXwBSAN4BAABfAFIA3wEAAGAAVwAUAAAAYAAkAIABAABgAGoA+wEAAGEAMwAUAAAAYQA1ABQAAABhABkAGgAAAGEAbgAaAAAAYQBzAB4AAABhAHQAHwAAAGEAbgAgAAAAYQBqACYAAABhAG4AKAAAAGEAGgAsAAAAYQApAEYAAABhAG8ASAAAAGEAcgBKAAAAYQB3APQAAABhAHAA/AAAAGEAcQD8AAAAYQBuAAIBAABhAB0ABwEAAGEAagAxAQAAYQAcAEABAABhAEkAQwEAAGEASQBFAQAAYQApAEkBAABhACkAVgEAAGEAAwBcAQAAYQApAGUBAABhAAMAZwEAAGEAKQBuAQAAYQApAHABAABhABcAhwEAAGEAKQCZAQAAYQApAKgBAABhAGEAqQEAAGEAaQCqAQAAYQBtAKsBAABhAGIArAEAAGEAYwCtAQAAYQBQAK4BAABhAEkArwEAAGEANgCwAQAAYQA2ALEBAABhAEkAsgEAAGEANgCzAQAAYQA2ALQBAABhAHwAtQEAAGEASQC2AQAAYQBlALcBAABhADYAuAEAAGEAfgC5AQAAYQB/ALoBAABhAGYAuwEAAGEANgC8AQAAYQBkAL0BAABhAGMAvgEAAGEAewDAAQAAYQAVAOEBAABhACkA8QEAAGEAKgD9AQAAYQBLAA8CAABhAEgAGgIAAGEALQAxAgAAYQBqADgCAABiAHgAFAAAAGIAegCAAQAAYgAeANcBAABiAHgA+wEAAGMALQAUAAAAYwACAIABAABjAB8A1wEAAGMALQD7AQAAZABqABQAAABkACQAgAEAAGQAIADXAQAAZABqAPsBAABqACQARgIAAGsAJABGAgAAbABqABQAAABtAGoAFAAAAG4ABQDmAQAAbwAkAIgBAABwAAgA0gEAAHAACADUAQAAcgApABQAAAByACQARgIAAHMAKQD2AQAAdAAlAFQCAAB1ACkAFAAAAHUAJgBHAQAAdQAnAEcBAAB1ACQARgIAAHYABwBfAQAAdwBoABQAAAB3AHoAowEAAHcAegCmAQAAdwAyADQCAAB3ACkANgIAAHgAdgAUAAAAeQApABQAAAB5ADIAKgIAAHoAKACEAQAAewAiAPMBAABEAAAAAQAAAHIAAAAAAAAALgAAAAAAAADoiwEAAAAAAEUAAAABAAAAKAAAABhZAAA2AAAAAAAAACWMAQAAAAAARgAAABEQAAByAAAAGFkAAC8AAAAAAAAAbYwBAAAAAABHAAAAAQAAAEMAAAAAAAAA3wAAAAAAAACAjAEAAAAAAEgAAAAREAAAcgAAACBZAAAvAAAAAAAAAJmMAQAAAAAASQAAABEQAAByAAAAKFkAAC8AAAAAAAAArIwBAAAAAABKAAAAERAAAHIAAAAgWQAALwAAAAAAAAC/jAEAAAAAAEsAAAAREAAAcgAAADBZAAAvAAAAAAAAAM+MAQAAAAAATAAAABEQAAByAAAAKFkAAC8AAAAAAAAA4owBAAAAAABNAAAAERAAAHIAAAAoWQAALwAAAAAAAAD1jAEAAAAAAE4AAAAREAAAcgAAACBZAAAvAAAAAAAAAAiNAQAAAAAATwAAABEQAAByAAAAIFkAAC8AAAAAAAAAJ40BAAAAAABQAAAAERAAAHIAAAAgWQAALwAAAAAAAAA3jQEAAAAAAFEAAAAREAAAcgAAACBZAAAvAAAAAAAAAEqNAQAAAAAAUgAAABEQAAByAAAAKFkAAC8AAAAAAAAAWo0BAAAAAABTAAAAERAAAHIAAAAgWQAALwAAAAAAAABzjQEAAAAAAFQAAAAREAAAcgAAADhZAAAvAAAAAAAAAIONAQAAAAAAVQAAABEQAAByAAAAKFkAAC8AAAAAAAAAlo0BAAAAAABWAAAAERAAAHIAAAAgWQAALwAAAAAAAAC4jQEAAAAAAFcAAAAREAAAcgAAAChZAAAvAAAAAAAAANeNAQAAAAAAWAAAABEQAAByAAAAKFkAAC8AAAAAAAAA7Y0BAAAAAABZAAAAERAAAHIAAAA4WQAALwAAAAAAAAAAjgEAAAAAAFoAAAAREAAAcgAAADBZAAAvAAAAAAAAABOOAQAAAAAAWwAAABEQAAByAAAAQFkAAC8AAAAAAAAAL44BAAAAAABcAAAAERAAAHIAAAAwWQAALwAAAAAAAABLjgEAAAAAAF0AAAAREAAAcgAAAChZAAAvAAAAAAAAAGeOAQAAAAAAXgAAABEQAAByAAAAKFkAAC8AAAAAAAAAiY4BAAAAAABfAAAAAAAAAHIAAABIWQAA4gAAAJiQAQCcjgEAAAAAAGAAAAABAAAAcgAAAAAAAADiAAAAsJABAMaOAQAAAAAAYQAAAAEAAAA0AAAAAAAAAOIAAADAkAEA344BAAAAAABiAAAAAQAAAHIAAAAAAAAA7wAAAAAAAAAWkAEAAAAAAGMAAAABAAAAcgAAAAAAAADwAAAAAAAAADSQAQAAAAAAZAAAAAEAAAByAAAAAAAAAPEAAAAAAAAAUpABAAAAAAADAAEAAQAAAPpRAAC1AAAAcBBFAQIAGgALAHEQFwAAAAoBWSEjABoBBABxEBcAAQAKAVkhFAAaAQYAcRAXAAEACgFZISIAGgEJAHEQFwABAAoBWSElABoBAwBxEBcAAQAKAVkhJgBxEBcAAAAKAVkhJwBxEBcAAAAKAVkhJABxEBcAAAAKAFkgEwAaAOQAcRApAAAADABuEEYBAAAMAFsgIAAaAJsBWyAfABMAIgFZICEAEwDSAFkgGwAaAAoAcRAXAAAACgFZIRUAcRAXAAAACgBZIBoAGgAIAHEQFwAAAAoBWSEoAHEQFwAAAAoAWSApABQAZmZmP1kgGQAaAAIAcRAXAAAACgFZIRYAcRAXAAAACgBZIBcAGgAMAHEQKQAAAAwAbhBGAQAADABbIBwAGgANAHEQKQAAAAwAbhBGAQAADABbIBgAGgAFAHEQFwAAAAoAWSASABoABwBxEBcAAAAKAFkgEQATAC0AWSAeABoAngFbIB0ADgAAAAUAAgAEAAAAF1IAAD4AAAASABIBcEAxAEMQEwA8AFkwKgBuEK4AAwBuILcAEwBuILUAEwAiAHkAcBBUAQAAWzAxACIAeAAaAT8AcQBWAQAADAJwMFMBEAJbMCsAUjAqAD0ABwATAegDswGBECgDFgDoA1owMAAiAHcAcCBOATAAWzAvAG4QUgEAAA4ABAACAAMAAAApUgAABwAAABIAYgEFAG4wEwADAQ4AAAAMAAoABQAAADBSAAAZAAAAVCAtAHEwGABlBwoBbiAcABAAVCAtAG4gGgBAAFQgLQBuIB0AgABUIC0AblASAJO6DgAAAAsACQAFAAAASlIAABQAAABUICwAcTAYAGUHCgFuIBwAEABUICwAbiAaAEAAVCAsAG5QEgCDqQ4AEwAKAAYAAABhUgAAHgAAAAeQVAEsAHEwGADcDgoCbiAcACEAVAEsAAGybiAaALEApgYPEaYHEBJUCCwAB6MB9AIFEAB0BhUAAwAOABUACwAGAAAAe1IAACYAAAAHoFQBLQBxMBgA7Q8KAm4gHAAhAFQBLQABwm4gGgDBAFQBLQACAxAAbiAdADEAVAktAAe0AgURAAIGEgACBxMAAggUAHQGFAAEAA4AFQALAAYAAACXUgAAJwAAAAegVAEtAAICEACCI24gHQAxAFQBLQBxMBgA7Q8KA24gHAAxAFQBLQABw24gGgDBAKYHEROmCBIUVAktAAe0AgURAAIGEgB0BhUABAAOAAAADAAKAAUAAACzUgAARwAAAFQgLgBxMBgAZQcKAW4gHAAQAFQgLgBuIBoAQABuELAAAgAKABMBgAc2ECUAbhCvAAIACgA3EAMAKB1uELAAAgAKADIQDwBuEK8AAgAKADMQAwAoB1QgLgBuICAAsAAoElQgLgAVAQBAxrFuICAAEAAoCVQgLgAVAYBAxrFuICAAEABUIC4AblAWAIOpDgAAAAUAAQADAAAA0VIAAGAAAAAiABEAcBAZAAAAW0AtAGIBAgBuIB4AEABUQC0AEhFuIBsAEABUQC0AEgJxMBgAIgIKA24gHAAwACIAEQBwEBkAAABbQCwAYgMBAG4gHgAwAFRALABuIBsAEABUQCwAcTAYACICCgNuIBwAMAAiABEAcBAZAAAAW0AuAGIDAQBuIB4AMABUQC4AbiAbABAAVEAuAHEwGAAiAgoBbiAcABAAVEAuAGIBAABuIB8AEABUQC4AFAHNzIw/biAdABAADgAFAAIAAwAAAONSAAAVAAAAOAQUAG4QsQADAAoAOQAOAG4gpwBDAFQwMQBxAE0BAAALAW4wVQEQAg4AAAAJAAEABAABAOxSAABKAAAAEwAKAHEQKAAAAFSALwBuEE8BAAAKADgAPgBUgC8AbhBQAQAACgA5ADYAUoAqADkACAAWAPQBcSBRARAAKOdxAE0BAAALAG4QswAIAHEATQEAAAsCvAJThDAAvCQWBgAAcUBEAXZUCwRThjAAcUBDAVR2CwRxIFEBVAAoCw0AGgHuAG4QQgEAAAwCcSAsACEAKL0OABUAAAAoAAEAAQFvPgQAAgAAAAAAFVMAAA4AAABZIyoAPQMHABMA6AOzMIEAKAMWAOgDWiAwAA4AAgACAAEAAAAAAAAABgAAAHAQRQEAAFsBMgAOAAIAAQABAAAAAAAAAAYAAABUEDIAbhC8AAAADgABAAEAAQAAAB1TAAAEAAAAcBCjAAAADgASAAEABgAAACFTAADwAAAACAARACIBYQBwIPMAAQBuEAkBAQAaAicAbiD6ACEAEghxEDcBCAAMAhoDSQBuMP4AMQIaAkAAcRA7AQIADAIaA0sAbjD/ADECGgIbAHEQMwEIAAwDbjD2ACEDGgIpAHEQMwEIAAwDbjD7ACEDcRAzAQgADAIaCQMBbjADAZECGgIcAHEQMwEIAAwDbjD5ACEDGgP9AHEQNwEIAAwEEgUTBmQAElcHEnQGAgECABoCKgBxEDMBCAAMA24w+wAhAxoKOQAaC5wBbjD4AKELGgP+AHEQNwEIAAwEEwXO/wcSdAYCAQIAcRA3AQgADAIaDP8AEl1uXQEBwYIaDuoAGg/rABoH7AAkMIAA/gcMAnEQNwEIAAwDGgbzAG5AAAFhMhoCLQBuIDABIQAiAkYAcCC4AAIAGgMdAG4w9wAxAm4w+AChCxoD/gBxEDcBCAAMBBMKZAASWwcSCBAGAAGmB3oBt3QGAgECAHEQNwEIAAwCbl0BAcGCcRAzAQgADAJuMAMBkQJuEA4BAQAaAgkBbiAEASEAGgP+AHEQNwEIAAwEEwZkABJXBxJ0BgIBAgAaAhMAbiAFASEAcRA3AQgADAJuXQEBwYIkMIAA/goMAnEQNwEIAAwDCAQQAG5AAAFBMg4ABAABAAMAAABJUwAAGQAAACIAAwBwIAAAMAAaARUAbiAFABAAGgEKAW4gAgAQABoB6AASAm4wBAAQAm4QBwAAAA4AAAACAAIAAgAAAFdTAAAHAAAAbyCkABAAcBC7AAAADgAAAAIAAgABAAAAAAAAAAYAAABwEEUBAABbATMADgAEAAMAAwAAAAAAAAAGAAAAVBAzAG4wHQEgAw4AAgACAAEAAAAAAAAABgAAAHAQRQEAAFsBNAAOAAMAAgACAAAAAAAAAAYAAABUEDQAbiAcASAADgABAAEAAQAAAAAAAAAEAAAAcBBFAQAADgADAAMAAgAAAAAAAAAEAAAAcSAeASEADgADAAIAAgAAAAAAAAAHAAAAVBA1AG4gHwEgAAoCDwIAAAIAAgABAAAAAAAAAAYAAABwEEUBAABbATUADgACAAIAAQAAAAAAAAAGAAAAcBBFAQAAWwE2AA4AAwACAAIAAAAAAAAABgAAAFQQNgBuICABIAAOAAIAAgABAAAAAAAAAAYAAABwEEUBAABbATcADgADAAIAAgAAAAAAAAAGAAAAVBA3AHEgFAEgAA4ABgAGAAEAAAAAAAAADgAAAHAQRQEAAFsBOABbAjkAWwM6AFsEOwBbBTwADgAKAAMABwAAAAAAAAAQAAAAVHA4AFRxOQBUcjoAVHM7AFR0PAAHhQGWdAchAQAADgABAAEAAQAAAAAAAAAEAAAAcBBFAQAADgADAAMAAgAAAAAAAAAEAAAAcSAiASEADgACAAIAAQAAAAAAAAAGAAAAcBBFAQAAWwE9AA4ABAADAAMAAAAAAAAABgAAAFQQPQBuMBoBIAMOAAEAAQABAAAAAAAAAAQAAABwEEUBAAAOAAMAAwACAAAAAAAAAAQAAABxIBsBIQAOAAQABAABAAAAAAAAAAoAAABwEEUBAABbAT4AWwI/AFsDQAAOAAUAAgAEAAAAAAAAAAoAAABUMD4AVDE/AFQyQABxQBgBEEIOAAEAAQABAAAAAAAAAAQAAABwEEUBAAAOAAMAAwACAAAAAAAAAAQAAABxICYBIQAOAAIAAgABAAAAAAAAAAYAAABwEEUBAABbAUEADgAEAAMAAwAAAAAAAAAGAAAAVBBBAHEwFwEgAw4ABwAHAAEAAAAAAAAAEAAAAHAQRQEAAFsBQgBbAkMAWwNEAFsERQBbBUYAWQZHAA4ACQACAAcAAAAAAAAAEQAAAFRwQgBUcUMAVHJEAFRzRQBUdEYAUnVHAAeGdAcWAQAADgAAAAYABgABAAAAAAAAAA4AAABwEEUBAABbAUgAWwJJAFsDSgBbBEsAWwVMAA4ACgADAAcAAAAAAAAAEAAAAFRwSABUcUkAVHJKAFRzSwBUdEwAB4UBlnQHJQEAAA4AAwADAAEAAAAAAAAACAAAAHAQRQEAAFsBTQBbAk4ADgAEAAIAAwAAAAAAAAAIAAAAVCBNAFQhTgBuMBUBEAMOAAIAAgABAAAAAAAAAAYAAABwEEUBAABbAU8ADgADAAIAAgAAAAAAAAAGAAAAVBBPAHEgEwEgAA4AAgACAAEAAAAAAAAABgAAAHAQRQEAAFsBUAAOAAQAAwADAAAAAAAAAAYAAABUEFAAcTAoASADDgAGAAIABQAAAAAAAAANAAAAVEBRAFRBUgBUQlMAVENUAG5VIwEQMgoFDwUAAAUABQABAAAAAAAAAAwAAABwEEUBAABbAVEAWwJSAFsDUwBbBFQADgAJAAMABgAAAAAAAAAPAAAAVGBVAFRhVgBUYlcAVGNYAAd0B4V0BikBAAAKBw8HAAAFAAUAAQAAAAAAAAAMAAAAcBBFAQAAWwFVAFsCVgBbA1cAWwRYAA4ABgACAAUAAAAAAAAADQAAAFRAWQBUQVoAVEJbAFRDXABuVSQBEDIKBQ8FAAAFAAUAAQAAAAAAAAAMAAAAcBBFAQAAWwFZAFsCWgBbA1sAWwRcAA4ABwAHAAEAAAAAAAAAEAAAAHAQRQEAAFsBXQBbAl4AWQNfAFsEYABbBWEAWwZiAA4ACQACAAcAAAAAAAAAEQAAAFRwXQBUcV4AUnJfAFRzYABUdGEAVHViAAeGdAcnAQAADgAAAAIAAgABAAAAAAAAAAYAAABwEEUBAABbAWMADgADAAIAAgAAAAAAAAAGAAAAVBBjAG4gGQEgAA4ABwAHAAEAAABfUwAAEAAAAFsBZABbAmkAWQNnAFkEZgBbBWgAWwZlAHAQRQEAAA4ACAAEAAIAAABrUwAAXgAAAFRAaQBSQWcAkgEBBlJCZgCwIW4gOAEQAFRAaQBuEDYBAAAKADwACwBUQGQAcRAGAQAADABSACUAKAlUQGQAcRAGAQAADABSACYAVEFoACICdQBwEEkBAgBUQ2UAbiBLATIADAIaAxEAbiBLATIADAJuIEoBAgAMAhoDDgBuIEsBMgAMAlRDaQBuEDYBAwAKA24gSgEyAAwCGgMSAG4gSwEyAAwCbhBMAQIADAJxECkAAgAMAm4gnQAhAA4AAgACAAAAAACCUwAAAQAAAA4AAAACAAIAAAAAAIlTAAABAAAADgAAAAIAAQABAAAAkFMAAAsAAABUEGoAbhCRAAAADAByED0BAAAMABEAAAADAAMAAQAAAJVTAAAIAAAAWwFrAHAQRQEAAFsCagAOAAQAAgACAAAAoFMAAAoAAABUIGoAcRApAAMADAFuIJ0AEAAOAAUAAQAFAAAAqFMAABMAAAAHQCIBEgASAnAwIQAhAiIDEgBwMCEAIwIHMiIDWwBwUOQAQyERAwAABQACAAUAAAC/UwAAPQAAACIANwAS8XAwWgAQARJxElJuUlsAEBIiAS8AVDJtAHAgPgAhAG4gRAABAHEQKQAEAAwCbiBHACEAEgJuID8AIQBUMmwAUiIWAG4gQQAhAFQybABSIikAbiBIACEAVDJsAFIiKQBuIEMAIQBUMmwAUiIpAG4gQgAhABEBAAALAAIABQAAANpTAACPAAAAIgA3ABLxcDBaABABEgESUm5RWwAQEiIDOABUlG0AcCBcAEMAbiBiAAMAEwQRAG4gZQBDABIVbiBjAFMAIgY4AFSXbQBwIFwAdgBuIGUARgBuUmQAFhJuIGMAVgBUkmwAUiIUAG4gYAAmABMCCABuIGYAJgAiAkEAVJdtAHAgkAByAFSXbABSdxcAbiCSAHIAIgd1AHAQSQEHABoIYQJuIEsBhwAMB24gSwGnAAwHGggBAG4gSwGHAAwHbhBMAQcADAdxECkABwAMB24gnQByAG4glABCAFSUbABSRCkAbiCeAEIAEgRuMKAAQgUTBBQAblSaABIUIgFSAHBA0gBhom4gmQASAG4gXQAjAG4gXQBjAFSRbwBuIF0AMQARBgAABQACAAMAAAAOVAAALgAAACIAAwBUMW0AcCAAABAAGgEXAG4gBQAQABoBTwBuIAIAEAAiAUgAcCC+ADEAGgIyAW4wBAAgASIBSgBwEMIAAQAaAuYAbjADACABbhABAAAADAFuEAgAAQASEg8CDgAFAAYAAAAmVAAARAAAACIAAwBUkW0AcCAAABAAGgE3AG4gBQAQACIBMwBUkm0AcCBOACEAEiJuIFAAIQBuEDYBCgAKAnEQSAECAAwCbiBRACEAbiAGABAAIgJOAAcjB5QHpQcWB7cHyHYGygADABoD6ABuMAQAMAIiAk8AcBDMAAIAGgMlAG4wAwAwAm4QBwAAABISDwIPAAUABgAAAEhUAAA/AAAAIgADAFShbQBwIAAAEAAaATgAbiAFABAAIgEzAFSibQBwIE4AIQASEm4gUAAhAG4QOgELAAwDbiBRADEAbiAGABAAIglWAAeTB6QHtQcWB8cH2HYG2gADABoD6ABuMAQAMAkiA1MAcBDUAAMAGgQlAG4wAwBAA24QBwAAAA8CAAAKAAYAAwAAAGpUAACKAAAAbhAuAAkACgArAHwAAAASAA8AFQAAP24gLAEEAFJgAwBuEC8ACQAKAVJSAwCCIschhxGwEFJhBABuEDAACQAKAlJTBACCM8cyhyKwIVRCdABZIAMAVEJ0AFkhBABuEBABBwAMAh8CKwBZIA4AWSEPAFRDdQByMDcAcwIoQBUAgD9uICwBBABuEC8ACQAKAFJRAwCCEccQhwBuEDAACQAKAVJSBACCIschhxESUjUgJwA1ISUAVUJwADgCIQBwEA8BBAAoHG4QLwAJAAoAhwBZUAMAbhAwAAkACgCHAFlQBABUQHQAUgADAFlgAwBUQHQAUgAEAFlgBAAAABIQDwAAAAABAwAAAAAAXgAAADoAAAAFAAAAAgABAAAAAAC5VAAAAwAAAFQQbAARAAAABQACAAUAAAC/VAAAJAAAACIAQQBUMW0AcCCQABAAcRApAAQADAFuIJ0AEABUMWwAUhEpAG4gngAQABMBCgASUm5SmgAQEnAgBwEDACIBYABwMPAAMQARAQQAAgABAAAA0FQAABQAAACCMFQhbQBuEAkAAQAMAW4QEAABAAwBUhEJAKgAAAEVAQA/xhCHAA8ABQACAAMAAADXVAAAEgAAAIJAVDFtAG4QCQABAAwBbhAQAAEADAESEnEwLQACAQoAhwAPAAMAAgADAAAA3lQAAAkAAAAiAEQAcBClAAAAcDD0ACEADgAAAA0AAwAIAAAA5VQAAEUAAABwIFIAugASEFygcABbq20AW6xsACIAEgASAXAwIQAQAVugdAAiATwAcCB0ALEAW6FyACIBOABwIFwAsQBboXMAIgE2AHAgUwCxAFuhcQAiATgAcCBcALEAW6FvACIBKwAS4xLkUgUDAFIGBAASJxQICAGAAhLpBxJ2CDQAAgBboXYAcBD9AAoADgAAAAUAAwACAAAA+lQAABAAAABwIPUAMgAMACIBWABwIN4AQQBuIEUAEABwIAcBAgAOAAUAAwACAAAAC1UAABAAAABwIPUAMgAMACIBTQBwIMgAQQBuIEUAEABwIAcBAgAOAAUAAwADAAAAG1UAABAAAABwIPUAMgAMACIBVwBwMNwAIQRuIEUAEABwIAcBAgAOAA4AAwAHAAAALFUAAG8AAABwIPUAywAMB1SwbQBuEAkAAAAMAG4QEAAAAAwAEhEVAoBBcTAtACEACggiABYAcBAkAAAABwkiAHUAcBBJAQAAbiBLAcAADAAaARAAbiBLARAADABuEDIBDQAKATgBBQAaAekAKAMaAecAbiBLARAADABuEEwBAAAMAHEQKQAAAAwAbiBHAAcAbhAyAQ0ACgA4AAcAVLBsAFIAEgAoBVSwbABSABEAbiAlAAkAbiAmAIkAbiBAAJcAIgpVAAegB7EH0gdzB8QHlQGGdgfYAAAAbiBFAKcAcCAHAXsADgAAAAUAAgAFAAAAUlUAAC8AAAAiAEEAVDFtAHAgkAAQAFQxbABSERcAbiCSABAAcRApAAQADAFuIJ0AEAATAREAbiCUABAAVDFsAFIRKQBuIJ4AEAASARISbjCgABACEgESUm5SmgAQEnAgBwEDAA4AAAAFAAMAAgAAAGZVAAAsAAAAIgAwAFQhbQBwIEkAEABxECkAAwAMAW4gTAAQAFQhbABSESkAbiBNABAAVCFsAFIREwBxEA8AAQAMAW4gSgAQACIBVABwINYAQQBuIEsAEABwIAcBAgAOABQAAQAFAAAAelUAAD0CAAAIABMAdgEqARMADAFuIC4BEAAiASkAEuJwMDMAIQJuIC0BEABUAW8AEhNuIGMAMQBUAXYAFAQzAIAAWRQNAFQBdgBUBHQAUkQDAFkUDgBUAXYAVAR0AFJEBABZFA8AVAFyABIEbiB5AEEAVAFyAFQFbABxEFcBBQAUBWZmZj9uIHYAUQBUAXMAEwUIAG4gZgBRAFQBcwBUBWwAUlUVAG4gYABRAFQBcwBuIGMAMQBUAXMAIgU3AFQGbABxEFcBBgATBiIBcCANAWAACgZwMFoAZQJuIGIAUQBUAW0AbhAJAAEADAFuEBAAAQAMARUFgEFxMC0AUwEKASIFFgBwECQABQBUBmwAUmYVAG4gJQBlAG4gJgAVAFQGcwBuIF8AVgBUBnEAYgcQAG4gWQB2AFQGcQAiBzsAcDByACcCbiBWAHYAVAZsAHEQVwEGAFQGbQBuEAkABgAMBm4QEAAGAAwGFQc0QnEwLQBzBgoGh2ZUB3EAbhBUAAcADAdZdgsAWXYKAFQIbABxEFcBCAAaCJ4BcSAqAEgADAhUCXEAIYpxMBEASAoMCm4gVQCpAAd5HwkqABMKCgBwIAsBoAAKC1mbDABUCXEAdgEqARMADAtuIFgAuQBUCXEAIgteAHAg6gALAG4gVwC5ACIJPABUC20AcCB0ALkAEltuW3cAqasTDBAAbiB4AMkAIgxBAFQNbQBwIJAA3ABUDWwAUt0oAG4gngDcABINbjCgANwDVA1sAFTdIABuIJ0A3AAVDZBBbiCfANwAEw0RAG4glADcACIOOwBwMHIALgITDw4AbiBzAP4AbiCXAOwAIg9BAFQCbQBwIJAALwAH8lQPbABxEFcBDwAaD5sBcRApAA8ADA9uIJ0A8gBiDwgAbiCTAPIAEv9uIJgA8gBuIJwAMgBuIJsAMgBUA2wAUjMoAG4gngAyABUDIEFuIJ8AMgBuIJQA0gBuW5oAQkQiAz0AVAttAHAgegCzACILNwBUBGwAcRBXAQQAEwTSAHAgDQFAAAoEcDBaAPsEB7RuIH0AQwBUC2wAUrsaAG4gfACzACILPABUD20AcCB0APsAEj9uX3cAq69uIHgA2wAiCjsAEu1wMHIA2g0TDQkAbiBzANoAIg0vAFQPbQBwID4A/QBUD2wAVP8cAG4gRwD9AG4gRACtABIPbiBBAP0AVA9sAFL/KABuIEgA/QAiD0kAcCDAAA8AbiBFAP0AIg9LAHAgxAAPAG4gRgD9ACIPOwACEgEAEuFwMHIAHwEH8RMPCwBuIHMA8QAiDy8ACBAEAFQEbQBwID4ATwAH9FQPbABU/xgAbiBHAPQAbiBEABQAEg9uIEEA9ABUD2wAUv8oAG4gSAD0ACIPTABwIMYADwBuIEUA9ABuIHUAyQBUD28AbiB7APMAbiB1ANsAbiB1AEsAVA9zAG4gXQCfAFQPcwBuIF0ALwBUD3MAbiBdAD8AVA9zAG4gXQC/AFQPcgAIEQEAVAFxAG4gdQAfAFQBcgBuIAgBEABUAXMAbiAIARAADgAAAAgAAwAFAAAAS1YAAHMAAAAiADcAEvFwMFoAEAEScRJSblJbABASIgE4AFRSbQBwIFwAIQAiAi8AVFNtAHAgPgAyACIDdQBwEEkBAwBuIEsBYwAMAxoEEQBuIEsBQwAMA1RUbABSRCIAbiBKAUMADAMaBA4AbiBLAUMADANuEDYBBwAKBG4gSgFDAAwDGgQSAG4gSwFDAAwDbhBMAQMADANxECkAAwAMA24gRwAyABIDbiA/ADIAbiBEAAIAVFNsAFIzFgBuIEEAMgBUU2wAUjMpAG4gSAAyACIDWgBwVuIAUyduIEYAMgBuIF0AIQBwIAcBFQAOAAAACAADAAUAAABzVgAAcwAAACIANwAS8XAwWgAQARJxElJuUlsAEBIiATgAVFJtAHAgXAAhACICLwBUU20AcCA+ADIAIgN1AHAQSQEDAG4gSwFjAAwDGgQRAG4gSwFDAAwDVFRsAFJEIgBuIEoBQwAMAxoEDgBuIEsBQwAMA24QOgEHAAwEbiBLAUMADAMaBBIAbiBLAUMADANuEEwBAwAMA3EQKQADAAwDbiBHADIAEgNuID8AMgBuIEQAAgBUU2wAUjMWAG4gQQAyAFRTbABSMykAbiBIADIAIgNcAHBW5gBTJ24gRgAyAG4gXQAhAHAgBwEVAA4AAAAQAAQABwAAAJtWAADHAAAAbhA2AQ8ACgA6ALsAbhA2AQ8ACgAh4TUQtAAh4BIhNBCoACIAQQBUwW0AcCCQABAAIgF1AHAQSQEBAG4gSwHRAAwBGgIRAG4gSwEhAAwBVMJsAFIiIgBuIEoBIQAMARoCDgBuIEsBIQAMAW4QNgEPAAoCRgIOAm4gSwEhAAwBGgISAG4gSwEhAAwBbhBMAQEADAFxECkAAQAMAW4gnQAQAFTBbABSESkAbiCeABAAIgE6AFTCbQBwIGwAIQATAgoAElNuU3EAISMSEm4gcAAhAG4gbQABABICASkh4jUpNgAiAjkAVMNtAHAgZwAyAAcqRgIOCW4gagAqAFTCbABSIikAbiBrACoAVMJsAFIiIwBxEA8AAgAMAm4gaAAqAAGVIgtdAAeyB8MH9AcGB9cH6HYH6AACAG4gaQC6AG4gbQChANgJCQEoym4QNgEPAAoCbiBvACEADAJuEDIAAgAKAm4gbgAhAHAgBwEcAA4AIgBsABoB7QBwID8BEAAnACIAbAAaAS8BcCA/ARAAJwAAAAsABQAGAAAA6VYAAAoAAAASFQdgB3EHggGTAaR0BgIBAAAOABYABgAHAAAA91YAAA0BAAAIBxAAAggTAAIJFAACChUAdAE2ARIACgA0gPcAdAE2ARIACgA2kPEAEhA0CuQAkQEJCLShOQHVADaYyQAiATgAVHJtAHAgXAAhAAcbEwEKABJSEgNuUmQAGzJuIGMACwATABEAbiBhAAsAIgBBAFRybQBwIJAAIAAHDCIAdQBwEEkBAAAIDREAbiBLAdAADAAaAhEAbiBLASAADABUcmwAUiIiAG4gSgEgAAwAGgIOAG4gSwEgAAwAdAE2ARIACgJuIEoBIAAMABoCEgBuIEsBIAAMAG4QTAEAAAwAcRApAAAADABuIJ0ADABUcGwAUgApAG4gngAMAFRwbABSACkAbiCVAAwAVHBsAFIAKQBuIJYADAAiAD8AVHJtAHAgfgAgAAcOkQAJCLOgbiCBAA4AYAAHABMCGgA0IAUAbiCCAD4AEwAjAG5RhAAOAXQBNgESAAoAbiCFAA4AbhCAAA4ADABUcWwAUhEkAGICBgBuMCIAEAJuEH8ADgAMAFRxbABSEScAYgIGAG4wIgAQAiIPXwAH8AgBEAAIAhIAAgMVAAIEEwAHxQgGEQB2B+wAAABuIIMA/gBuIF0AywBuIF0A6wBwIAcBtwAOAAgNEQAiAGwAGgHjAHAgPwEQACcACA0RACIAbAAaAQABcCA/ARAAJwAIDREAIgBsABoBAQFwID8BEAAnAAgNEQAiAGwAGgEwAXAgPwEQACcAAAAJAAMABQABAEJXAACAAAAAIgAJABIxIxGBABQCYv/+/iQQfwACAAwCEgNNAgEDFAKgAAEBJBB/AAIADAISFE0CAQQSIiM0fwBNBAECFAIA/wD/FQT//xQF/wAA/yQwfwAlBAwCcDAOABACIgFAAFRibQBwIIYAIQBxECkABwAMAm4gjAAhAFRibABSIikAbiCNACEAEwIKABJUblSLACE0bhAyAQgACgJuIIkAIQBuEIcAAQAMAm4gIwACAG4QiAABAAwCbiAjAAIAKBcNAhQDoAAIf24gjwAxABQDoQAIf24gjgAxABoDAgFuED4BAgAMBHEgKwBDACICWQBwIOAAggBuIIoAIQBwIAcBFgAOAE8AAAAOAAEAAQFrXgUAAgAFAAAAbVcAACEAAAAiAC4AVDFtAHAgOQAQABoBQAIaAgsBbkA7AEAhEgFuIDwAEAASUm5SPQAQEm4QOgAAAAwCbiA4ABIAcCAHAQMADgAAAAMAAgACAAAAf1cAAA4AAABUEG4AOQAIAFQQbwBuIF0AIAAoBG4gXQAgAA4AAwABAAMAAACIVwAAEgAAAFQgbQAaAVkCbiAKABAADAAfACwAWyB1AFQhdgByMDUAIAEOAAMAAQACAAAAj1cAAB4AAAASEFwgcABUIHIAEgFuIHkAEABUIHIAVCFsAHEQVwEBABQBZmZmP24gdgAQAFQgcwATAQgAbiBmABAADgACAAEAAgAAAJhXAAAGAAAAVBB1AHIgNgAQAA4AAwABAAIAAACeVwAAFQAAAFQgbgA4AAsAVCFvAG4gXQABABIAWyBuAA4AIgBtABoBNQFwIEABEAAnAAAABAABAAIAAACnVwAAEAAAABIAXDBwAFQxcgATAggAbiB5ACEAVDFzAG4gZgABAA4AAwABAAIAAACvVwAAFwAAABIQXCBwAFQgcgASAW4geQAQAFQgcgASAW4gdgAQAFQgcwATAQgAbiBmABAADgAAAAIAAQACAAAAuFcAAAkAAABuECsBAQATAAgAbiAvAQEADgAAAAMAAgACAAAAv1cAAAoAAABuEDIBAQAKAN8AAAFuIDQBAQAOAAIAAgABAAAAyFcAAAQAAAByEEcBAAAOAAYAAwADAAAA0FcAABEAAAAiAAgAGgFGAXEQJwAEAAwCcDANABACVDFtAG4gCwABAA4AAAAJAAcAAgAAAOBXAABLAAAAbhAyAQMACgDfAAABbiA0AQMAIgB1AHAQSQEAAG4gSwFQAAwAGgEQAG4gSwEQAAwAbhAyAQMACgE4AQUAGgHpACgDGgHnAG4gSwEQAAwAbhBMAQAADABxECkAAAAMAG4gRwAEAG4QMgEDAAoAOAAHAFQgbABSABIAKAVUIGwAUgARAG4gJQAGAG4gJgB2AG4gQABkAA4AAAADAAMAAgAAAPpXAAAEAAAAbiA0ASAADgAGAAQAAgAAAAVYAABRAAAAbhBeAAIACgATAQgAMxAnABIAbiBmAAIAIgB1AHAQSQEAABoBYAJuIEsBEAAMAG4gSwFAAAwAGgEAAG4gSwEQAAwAbhBMAQAADABxECkAAAAMAG4gnQADACgkbiBmABIAIgB1AHAQSQEAABoBYQJuIEsBEAAMAG4gSwFAAAwAGgEBAG4gSwEQAAwAbhBMAQAADABxECkAAAAMAG4gnQADAA4AAAACAAIAAQAAABtYAAAEAAAAcBAPAQAADgAGAAMAAwAAACJYAAAQAAAAcBARAQMAVDBtABoB4AASAnEwoQAQAgwAbhCiAAAADgACAAIAAAAAAC1YAAABAAAADgAAAAUAAgADAAAANlgAAC0AAAAiAAMAVDFtAHAgAAAQABoBFgBuIAUAEAAaATMBbiACABAAIgFQAHAgzgAxABoCMgFuMAQAIAEiAVEAcBDQAAEAGgLmAG4wAwAgAW4QAQAAAAwBbhAIAAEADgAAAAYAAwADAAAATlgAABAAAABwEBIBAwBUMG0AGgHhABICcTChABACDABuEKIAAAAOAAIAAgAAAAAAWVgAAAEAAAAOAAAAAgACAAEAAABiWAAABAAAAHAQCgEAAA4ACwAHAAMAAQBpWAAAVAAAAG4QTwAGAAwAbhBGAQAADABxEEEBAAAKAG4gOAEFACIAdQBwEEkBAABuIEsBgAAMABoBEQBuIEsBEAAMAFRBbABSESIAbiBKARAADAAaAQ4AbiBLARAADABuEDYBBQAKAW4gSgEQAAwAGgESAG4gSwEQAAwAbhBMAQAADABxECkAAAAMAG4gRwAHACgODQBUQW0AGgJMABIDcTChACEDDAFuEKIAAQAOAAAAAABFAAEAAQFxRgIAAgABAAAAiFgAAAQAAAByEAwAAAAOAAsABwADAAEAkVgAAFAAAABuEE8ABgAMAG4QRgEAAAwAbiA8AQUAIgB1AHAQSQEAAG4gSwGAAAwAGgERAG4gSwEQAAwAVEFsAFIRIgBuIEoBEAAMABoBDgBuIEsBEAAMAG4QOgEFAAwBbiBLARAADAAaARIAbiBLARAADABuEEwBAAAMAHEQKQAAAAwAbiBHAAcAKA4NAFRBbQAaAkwAEgNxMKEAIQMMAW4QogABAA4AAAAAAEEAAQABAXFCAgACAAEAAACwWAAABAAAAHIQDAAAAA4ACQAHAAIAAAC5WAAAPAAAAG4gOAFDACIAdQBwEEkBAABuIEsBYAAMABoBEQBuIEsBEAAMAFQhbABSESIAbiBKARAADAAaAQ4AbiBLARAADABuEDYBAwAKAUYBBwFuIEsBEAAMABoBEgBuIEsBEAAMAG4QTAEAAAwAcRApAAAADABuIJ0ABQAOAAMAAwACAAAAzlgAAAQAAABuIDQBIAAOAAQAAgACAAAA2VgAABMAAABUIG4AOQAJAHAg/AAyAAwAWyBuAA4AIgBtABoBNAFwIEABEAAnAAAAAgABAAAAAADjWAAAAwAAAFUQdwAPAAAAAgABAAIAAADnWAAABgAAACIAYgBwIDEBEAARAAIAAgABAAAA7VgAAAYAAABwEEUBAABcAXcADgACAAIAAAAAAPVYAAADAAAAXAF3AA4AAAACAAEAAgAAAOdYAAAGAAAAIgBjAHAgNQEQABEAAgABAAAAAADjWAAAAwAAAFIQeAAPAAAAAgACAAEAAADtWAAABgAAAHAQRQEAAFkBeAAOAAIAAgAAAAAA9VgAAAMAAABZAXgADgAAAAIAAQACAAAA/FgAAAYAAAAiAGQAcCA5ARAAEQACAAEAAAAAAAJZAAADAAAAVBB5ABEAAAACAAIAAQAAAAZZAAAGAAAAcBBFAQAAWwF5AA4AAgACAAAAAAAOWQAAAwAAAFsBeQAOAAoADjyHh4eHh2lpacNLS0uHaYdpWodpw8OHh0sAHQHcAg4CellRPDw8eNLSeDwAVQHhAg5pAHEJ4QLAAuwDgAPLArsE6APpA+8DDpZaWloAeAjhAsAC7AOAA8sC6APpA+8DDpZaWgCFAQnhAsAC7AOAA8sC3QTfBNkElwMOpWnSAF4K4QLAAuwDgAPLAscD/gL/AsgEyQQOpWl44QB+CuECwALsA4ADywK7BN0E3wTZBJcDDpaWaeEAZQnhAsAC7AOAA8sCywToA+kDtAQOllrx1GaTi1oARAAOeFpppXhaWpZ4WlqWeIcAKgHRAg6HPJcAMgAOWgEQEEtaH0sDAL4EAzxaAwK/BAMBEgUABQIeHgMAqANwlgUAHwBZAfwCDi20AAkADgAWAA54AwHUA2I9WqW0lpaWluGWeMOlARMQW6w8ARIPeHk9W9NbeNIAKgAOWgMAzQIEWlppPAAMAfgDDj08AI8CBsMEAAAAAAAOAJICA/sDzgTLAg7DARkPAwDZAgIBOA8AmgIB+wMOAJ8CAfsDDgDsAwAOAOMDAsMEwgQOWi0A6AMB1wMOlgCUBgAOHgMA1ANiaQMBoQMTagMCoAMTAJkBAcAEDmkDAMYDOFt4AwHMAjA8eEt4eHh5AMwCAcUEDmkDAMYDOFt4AwPWAjk8Wkx4AwbYAjk8PDx4XHgDAsIEQngBIA88eEtakDw8WwC+BQHWBA54AwDNAgRaWqmoSwMB5wIFPQCJAwTUBM4C+ALWBA54AwDNAgRbeAMBogM0S7Q9ARAXpj0AugME1ATOAvgC1gQOeAMAzQIEW3gDAaIDNEt4PQEQF6Y9AJkGBaEDoAPUA9YE8AIOAh13AmssW8MDAN0EAsMDAd8EAktLaQMC5AMsLS1aHwUABQEFAluWAwDwAwKXAwHxAwICadEFAAUBeHhpaQIaHQA0Ad4EDgDwAwHABA54AwDCBEJ4eGo9AMIGAZ4DDgC+BgGeAw4ARgHcAg6HAFAC3ALbAg49PC0th3h4eHgBExA8AJIBAsAE1AQOSwMAzAIwiDwAZgLABMMCDksDAMwCMIg8AL8EAvgCzQQOSwMAzAIwizwAcwLABNQEDksDB8wCMC+DfQMI7wMBaQMJ9gMXASkPARIPPD33PACuAQHABA54AwDCBEJ4eFp4Wls8AM8EAvgC1AQOeAMA0wIxeHi0iDwA2gQADpaXaniHiGnTeJZaARUQL4NuAwHvAwFaAwX2Axd4PFt4pQEWDwMGxQMCaQMHxAMqLS20AwjDA3+ltJameAMJzgM9S1t4AwzFBEJ4S3haWloDDsYEPFo9hwMCvARC4VpLPDx4Wjw9eAMD+QM+AREPAwT6Ayo8eXgDC80DPUs9aQMKmQM8W3gDDZgDMHg8S3gCEYYCE4YBBQUBAxLvAwFLAwHVAjxaAQQFBAMQ+gMqaQME1AIweDxLeIg8Wzw9WlpaWwEEBQEDEdUCPFtaWgD8AgL4AtQEDmkDAMYDOFt5AwHIAzl4AwLOAjABNg9LPHh5AhmGPTwArQMC+ALUBA5pAwDGAzhbeQMByAM5eAMCzgIwATYPSzx4eQIZhj08AJYEA/gC4wPUBA7UTHgDAMIEQgE4D3l4AwHuAztpSz0BAgMJngMCPIcDCu0DOlp4tR4DBfoCAuUCdDsFBQUKAg87BQnxPAJjHQUABQGEAOEBBPgC1ATVA9MDDpYA8gEF+ALUBNUD0wO6BA4BFBE9XC6HAwvIAzl4PFuHAwzCBEIBOA94eHmHAw77A0Bpl1p40tICEwEUDjw9PAJUHQULBQwFDqKhoS0AwQECwATUBA4BLREDANoCCngDAb0EQXh4aXp4fBkeAwLuAmxpaZgFAog8AIUEAZsDDngDANcEL3hLS3k8AKkCAdYEDqU8AO4FAA7DWgCBBgAOPGnSeAD2BQAOWgDFAgAOTFo8GgCIBgAOPHhaAPoFAA48aWl4AI4GAA48WgCTAQLUBNYEDgBnAsMC1gQOAMEEAs0E1gQOtAMAowMJWgCBAQbUBMwCwAT2A+8D1gQOlgEpDwESDzw8ANMEA9QEzwKlAw4A5AIE2ALCBMUE1gQOh0sBIRA8ASAQAIAFAdYEDgCxBQLnAtgEDjzDALcFAucC2AQOAK0FAdYEDngDAM0CBFpaqahLAwHnAgU8AMIFAucC2AQOPMMAyAUC5wLYBA4A1wUB1gQOAJMDBtQEogPOAvgC5wLYBA7wATYRGx4DAO4CcsQFAACaAwLnAtgEDgDEAwbUBKIDzgL4AucC2AQOtAE2ERseAwDuAnLEBQAAywMC5wLYBA4ArAQG1AT6AsIE+ALjA9YEDjwBOA8A0wED1ATPAqUDDgC6AgHFBA5MaRsADwAOABcB1AQOAAoB1AQOPC0AEwHUBA4tABYB1AQOAA4ADgAJAdQEDjwtABIB1AQOLQAAAAABAAAAcwAAAAEAAAAGAAAAAQAAACUAAAABAAAAJgAAAAEAAAAxAAAAAQAAACcAAAABAAAAPgAAAAMAAAABAAAAIQAAAAEAAAABAAAAAwAAAAEAAQABAAAAAQAAAHQAAAACAAAAdAB0AAIAAAACAAIAAQAAACgAAAABAAAAagAAAAIAAABqAAYAAwAAAH4AAQABAAAAAwAAAAUAagABAAAAAQAAAGEAAAABAAAAfQAAAAEAAAByAAAAAQAAAAAAAAAFAAAAAAAAAAAAAAARAAAABAAAAAAAAAAAABEAAgAAAAEAAQAEAAAAAQABAAEAAQAHAAAAAQABAAEAAQABAAEAAQAAAAIAAAABABMAAQAAAAIAAAABAAAABQAAAAMAAAAFAB8AAQAAAAIAAAAFAEQAAgAAAAcAAQABAAAACAAAAAEAAAAJAAAAAQAAAAsAAAABAAAADQAAAAgAAAANAAEAAQABAAEAAAAAAAAACQAAAA0AAQABAAEAAQAAAAAAAAAAAAAACgAAAA0AAQABAAEAAQAAAAAAAAAAAAAACgAAAA0AAQABAAEAAQABAAAAAAAAAAAACQAAAA0AAQABAAEAAQB0AAAAAAAAAAAAAQAAAA8AAAABAAAAEAAAAAIAAAAUAAEAAQAAABUAAAABAAAAGQAAAAEAAAAeAAAAAgAAACgAKQABAAAAKQAAAAIAAAAyAH0AAQAAADUAAAADAAAAOABBAHQAAAAEAAAAOABBAHQAKAABAAAAPwAAAAMAAAA/AAEAfQAAAAEAAABHAAAABAAAAGEAEgASAGEAAgAAAGEAQQAGAAAAYQBiAC8AdAAWAAAABgAAAGEAYwABAAEAQQB0AAYAAABhAGMAAQBBAHQAgAAEAAAAYQBjAC8AdAAFAAAAYQBjADMALwB0AAAABAAAAGEAZAAvAHQABQAAAGEAZAAzAC8AdAAAAAIAAABhAHQAAQAAAGIAAAACAAAAYgAoAAYAAABiAC8AdAAWAAAAKAADAAAAYgAyAH0AAAAGAAAAYwABAEEAdACAACgABgAAAGMAMwAvAHQABwABAAYAAABkADMALwB0AAcAAQACAAAAcwAoAAQAAAB0AAAAAAARAAIAAAB0ABcAAgAAAHQAKAACAAAAdABiAAIAAAB0AGMABAAAAHQAYwABAAEABQAAAHQAYwABAAEAAQAAAAIAAAB0AGQAAgAAAHQAcwADAAAAdAB0AHQAAAACAAAAdAB6AAMAAAB0AIAAYwAAAAIAAACBAH8ABQAAABIAEgBhACgAJAAAAAIAAAAoACQABAAAAGMALwB0ACgABAAAAGQALwB0ACgAAgAAAHQAAQACIOKWswACIOKWvQAJIzAwMTIxMjEyAAcjMDBGRjAwAAkjMDBGRkZGRkYAByMxYjVlMjAAByM0MWMzMDAAByM3ZjAwMDAAByNEQkRCREIAByNGRjAwMDAACSNGRjEyMTIxMgAHI0ZGRkZGRgAIJiN4MjVCMzsACCYjeDI3MTU7AAInPgADKClWAAI6IAAPOiA8Zm9udCBjb2xvcj0nAAc8L2ZvbnQ+AMwCPGh0bWw+PGhlYWQ+PHN0eWxlPmJvZHl7Y29sb3I6IHdoaXRlO308L3N0eWxlPjwvaGVhZD48Ym9keT5UaGlzIGlzIFdlYlZpZXcsIHdpdGggUkVBTCBIVE1MIHN1cHBvcnQhPGRpdiBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjogZGFya2JsdWU7IHRleHQtYWxpZ246IGNlbnRlcjsiPlN1cHBvcnQgQ1NTPC9kaXY+PG1hcnF1ZWUgc3R5bGU9ImNvbG9yOiBncmVlbjsgZm9udC13ZWlnaHQ6Ym9sZDsiIGRpcmVjdGlvbj0ibGVmdCIgc2Nyb2xsYW1vdW50PSI1IiBiZWhhdmlvcj0ic2Nyb2xsIj5UaGlzIGlzIDx1PnNjcm9sbGFibGU8L3U+IHRleHQ8L21hcnF1ZWU+PC9ib2R5PjwvaHRtbD4ABjxpbml0PgAFQWxlcnQAJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBoaWRlIHRoZSBtZW51PwAnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGtpbGwgdGhlIG1lbnU/ABBCVE5fT0ZGX0JHX0NPTE9SAA9CVE5fT05fQkdfQ09MT1IABkJ1dHRvbgAIQnV0dG9uIDEACEJ1dHRvbiAyAAhCdXR0b24gMwAMQnV0dG9uQWN0aW9uAApCdXR0b25MaW5rAAtCdXR0b25Pbk9mZgAGQ0VOVEVSAA5DSEVDS0JPWF9DT0xPUgAFQ0xFQVIAEUNPTExBUFNFX0JHX0NPTE9SAAZDYW5jZWwACENhdGVnb3J5AApDYXRlZ29yeSAxAAhDaGVja0JveAAKQ2hlY2tCb3ggMQAKQ2hlY2tCb3ggMgALQ2xlYXJDYW52YXMACENvbGxhcHNlAApDb2xsYXBzZSAxAAtDb25maWcuamF2YQASRDgkJFN5bnRoZXRpY0NsYXNzAApEcmF3Q2lyY2xlABBEcmF3RmlsbGVkQ2lyY2xlAA5EcmF3RmlsbGVkUmVjdAAIRHJhd0xpbmUACERyYXdSZWN0AAhEcmF3VGV4dAAMRVNQVmlldy5qYXZhAA5FbnRlciBhIG51bWJlcgAMRW50ZXIgYSB0ZXh0ABVFeHRlcm5hbCBMaW5rICZuZWFycjsAAUYABEZJRkwABEZJTEwABkZJVF9YWQADRlBTAAhISDptbTpzcwALSGVsbG8gV29ybGQAAUkAAklJAARJSUlJAAJJTAADSUxMAARJbml0ABBJbml0aWFsaXplUGFpbnRzAAhJbnB1dE51bQAKSW5wdXROdW0gMQAJSW5wdXRUZXh0AAtJbnB1dFRleHQgMQAOSW52YWxpZCBudW1iZXIAAUoAA0pKSgBfS2lsbGluZyB0aGUgbWVudSB3aWxsIHJlbW92ZSBpdCBmcm9tIHRoZSBzY3JlZW4uIFlvdSBjYW4gYWx3YXlzIHJlc3RhcnQgdGhlIGFwcCB0byBnZXQgaXQgYmFjay4AAUwAAkxJAAJMTAADTExJAARMTElJAANMTEwABExMTEkAAkxaACFMYW5kcm9pZC9hcHAvQWxlcnREaWFsb2ckQnVpbGRlcjsAGUxhbmRyb2lkL2FwcC9BbGVydERpYWxvZzsAGUxhbmRyb2lkL2NvbnRlbnQvQ29udGV4dDsAMUxhbmRyb2lkL2NvbnRlbnQvRGlhbG9nSW50ZXJmYWNlJE9uQ2xpY2tMaXN0ZW5lcjsAIUxhbmRyb2lkL2NvbnRlbnQvRGlhbG9nSW50ZXJmYWNlOwAYTGFuZHJvaWQvY29udGVudC9JbnRlbnQ7ACRMYW5kcm9pZC9jb250ZW50L3Jlcy9Db2xvclN0YXRlTGlzdDsAH0xhbmRyb2lkL2NvbnRlbnQvcmVzL1Jlc291cmNlczsAGUxhbmRyb2lkL2dyYXBoaWNzL0JpdG1hcDsAIExhbmRyb2lkL2dyYXBoaWNzL0JpdG1hcEZhY3Rvcnk7ABlMYW5kcm9pZC9ncmFwaGljcy9DYW52YXM7ABhMYW5kcm9pZC9ncmFwaGljcy9Db2xvcjsAHkxhbmRyb2lkL2dyYXBoaWNzL1BhaW50JEFsaWduOwAeTGFuZHJvaWQvZ3JhcGhpY3MvUGFpbnQkU3R5bGU7ABhMYW5kcm9pZC9ncmFwaGljcy9QYWludDsAGExhbmRyb2lkL2dyYXBoaWNzL1BvaW50OwAiTGFuZHJvaWQvZ3JhcGhpY3MvUG9ydGVyRHVmZiRNb2RlOwAbTGFuZHJvaWQvZ3JhcGhpY3MvVHlwZWZhY2U7ACRMYW5kcm9pZC9ncmFwaGljcy9kcmF3YWJsZS9EcmF3YWJsZTsALExhbmRyb2lkL2dyYXBoaWNzL2RyYXdhYmxlL0dyYWRpZW50RHJhd2FibGU7ABFMYW5kcm9pZC9uZXQvVXJpOwAaTGFuZHJvaWQvb3MvQnVpbGQkVkVSU0lPTjsAE0xhbmRyb2lkL29zL0J1bmRsZTsAFExhbmRyb2lkL29zL1Byb2Nlc3M7ABdMYW5kcm9pZC90ZXh0L0VkaXRhYmxlOwATTGFuZHJvaWQvdGV4dC9IdG1sOwAWTGFuZHJvaWQvdGV4dC9TcGFubmVkOwAjTGFuZHJvaWQvdGV4dC9UZXh0VXRpbHMkVHJ1bmNhdGVBdDsAG0xhbmRyb2lkL3V0aWwvQXR0cmlidXRlU2V0OwAVTGFuZHJvaWQvdXRpbC9CYXNlNjQ7AB1MYW5kcm9pZC91dGlsL0Rpc3BsYXlNZXRyaWNzOwASTGFuZHJvaWQvdXRpbC9Mb2c7ABlMYW5kcm9pZC91dGlsL1R5cGVkVmFsdWU7ABpMYW5kcm9pZC92aWV3L01vdGlvbkV2ZW50OwAjTGFuZHJvaWQvdmlldy9WaWV3JE9uQ2xpY2tMaXN0ZW5lcjsAJ0xhbmRyb2lkL3ZpZXcvVmlldyRPbkxvbmdDbGlja0xpc3RlbmVyOwAjTGFuZHJvaWQvdmlldy9WaWV3JE9uVG91Y2hMaXN0ZW5lcjsAE0xhbmRyb2lkL3ZpZXcvVmlldzsAJUxhbmRyb2lkL3ZpZXcvVmlld0dyb3VwJExheW91dFBhcmFtczsAK0xhbmRyb2lkL3ZpZXcvVmlld0dyb3VwJE1hcmdpbkxheW91dFBhcmFtczsAKUxhbmRyb2lkL3ZpZXcvV2luZG93TWFuYWdlciRMYXlvdXRQYXJhbXM7ABxMYW5kcm9pZC92aWV3L1dpbmRvd01hbmFnZXI7ABxMYW5kcm9pZC93ZWJraXQvV2ViU2V0dGluZ3M7ABhMYW5kcm9pZC93ZWJraXQvV2ViVmlldzsAF0xhbmRyb2lkL3dpZGdldC9CdXR0b247ABlMYW5kcm9pZC93aWRnZXQvQ2hlY2tCb3g7ADdMYW5kcm9pZC93aWRnZXQvQ29tcG91bmRCdXR0b24kT25DaGVja2VkQ2hhbmdlTGlzdGVuZXI7AB9MYW5kcm9pZC93aWRnZXQvQ29tcG91bmRCdXR0b247ABlMYW5kcm9pZC93aWRnZXQvRWRpdFRleHQ7ABxMYW5kcm9pZC93aWRnZXQvRnJhbWVMYXlvdXQ7ACRMYW5kcm9pZC93aWRnZXQvSW1hZ2VWaWV3JFNjYWxlVHlwZTsAGkxhbmRyb2lkL3dpZGdldC9JbWFnZVZpZXc7ACpMYW5kcm9pZC93aWRnZXQvTGluZWFyTGF5b3V0JExheW91dFBhcmFtczsAHUxhbmRyb2lkL3dpZGdldC9MaW5lYXJMYXlvdXQ7ABxMYW5kcm9pZC93aWRnZXQvUmFkaW9CdXR0b247ABtMYW5kcm9pZC93aWRnZXQvUmFkaW9Hcm91cDsALExhbmRyb2lkL3dpZGdldC9SZWxhdGl2ZUxheW91dCRMYXlvdXRQYXJhbXM7AB9MYW5kcm9pZC93aWRnZXQvUmVsYXRpdmVMYXlvdXQ7ABtMYW5kcm9pZC93aWRnZXQvU2Nyb2xsVmlldzsAMExhbmRyb2lkL3dpZGdldC9TZWVrQmFyJE9uU2Vla0JhckNoYW5nZUxpc3RlbmVyOwAYTGFuZHJvaWQvd2lkZ2V0L1NlZWtCYXI7ABdMYW5kcm9pZC93aWRnZXQvU3dpdGNoOwAZTGFuZHJvaWQvd2lkZ2V0L1RleHRWaWV3OwAWTGFuZHJvaWQvd2lkZ2V0L1RvYXN0OwAqTGFuZHJvaWR4L2FwcGNvbXBhdC9hcHAvQXBwQ29tcGF0QWN0aXZpdHk7ABpMY29tL2tpbm9jcnAvZm1lbnUvQ29uZmlnOwAbTGNvbS9raW5vY3JwL2ZtZW51L0VTUFZpZXc7ADpMY29tL2tpbm9jcnAvZm1lbnUvTWFpbkFjdGl2aXR5JCRFeHRlcm5hbFN5bnRoZXRpY0xhbWJkYTA7ACBMY29tL2tpbm9jcnAvZm1lbnUvTWFpbkFjdGl2aXR5OwAyTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhMDsAM0xjb20va2lub2NycC9mbWVudS9NZW51JCRFeHRlcm5hbFN5bnRoZXRpY0xhbWJkYTEwOwAzTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhMTE7ADNMY29tL2tpbm9jcnAvZm1lbnUvTWVudSQkRXh0ZXJuYWxTeW50aGV0aWNMYW1iZGExMjsAM0xjb20va2lub2NycC9mbWVudS9NZW51JCRFeHRlcm5hbFN5bnRoZXRpY0xhbWJkYTEzOwAzTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhMTQ7ADNMY29tL2tpbm9jcnAvZm1lbnUvTWVudSQkRXh0ZXJuYWxTeW50aGV0aWNMYW1iZGExNTsAM0xjb20va2lub2NycC9mbWVudS9NZW51JCRFeHRlcm5hbFN5bnRoZXRpY0xhbWJkYTE2OwAzTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhMTc7ADNMY29tL2tpbm9jcnAvZm1lbnUvTWVudSQkRXh0ZXJuYWxTeW50aGV0aWNMYW1iZGExODsAM0xjb20va2lub2NycC9mbWVudS9NZW51JCRFeHRlcm5hbFN5bnRoZXRpY0xhbWJkYTE5OwAyTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhMTsAM0xjb20va2lub2NycC9mbWVudS9NZW51JCRFeHRlcm5hbFN5bnRoZXRpY0xhbWJkYTIwOwAzTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhMjE7ADNMY29tL2tpbm9jcnAvZm1lbnUvTWVudSQkRXh0ZXJuYWxTeW50aGV0aWNMYW1iZGEyMjsAMkxjb20va2lub2NycC9mbWVudS9NZW51JCRFeHRlcm5hbFN5bnRoZXRpY0xhbWJkYTI7ADJMY29tL2tpbm9jcnAvZm1lbnUvTWVudSQkRXh0ZXJuYWxTeW50aGV0aWNMYW1iZGEzOwAyTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhNDsAMkxjb20va2lub2NycC9mbWVudS9NZW51JCRFeHRlcm5hbFN5bnRoZXRpY0xhbWJkYTU7ADJMY29tL2tpbm9jcnAvZm1lbnUvTWVudSQkRXh0ZXJuYWxTeW50aGV0aWNMYW1iZGE2OwAyTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhNzsAMkxjb20va2lub2NycC9mbWVudS9NZW51JCRFeHRlcm5hbFN5bnRoZXRpY0xhbWJkYTg7ADJMY29tL2tpbm9jcnAvZm1lbnUvTWVudSQkRXh0ZXJuYWxTeW50aGV0aWNMYW1iZGE5OwAaTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkMTsAKExjb20va2lub2NycC9mbWVudS9NZW51JFRleHRWaWV3V3JhcHBlcjsAGExjb20va2lub2NycC9mbWVudS9NZW51OwAcTGNvbS9raW5vY3JwL2ZtZW51L1BCb29sZWFuOwAcTGNvbS9raW5vY3JwL2ZtZW51L1BJbnRlZ2VyOwAbTGNvbS9raW5vY3JwL2ZtZW51L1BTdHJpbmc7ACJMZGFsdmlrL2Fubm90YXRpb24vRW5jbG9zaW5nQ2xhc3M7ACNMZGFsdmlrL2Fubm90YXRpb24vRW5jbG9zaW5nTWV0aG9kOwAeTGRhbHZpay9hbm5vdGF0aW9uL0lubmVyQ2xhc3M7ACFMZGFsdmlrL2Fubm90YXRpb24vTWVtYmVyQ2xhc3NlczsAHUxkYWx2aWsvYW5ub3RhdGlvbi9TaWduYXR1cmU7ABhMamF2YS9sYW5nL0NoYXJTZXF1ZW5jZTsAFUxqYXZhL2xhbmcvRXhjZXB0aW9uOwAkTGphdmEvbGFuZy9JbGxlZ2FsQXJndW1lbnRFeGNlcHRpb247ACFMamF2YS9sYW5nL0lsbGVnYWxTdGF0ZUV4Y2VwdGlvbjsAE0xqYXZhL2xhbmcvSW50ZWdlcjsAIExqYXZhL2xhbmcvSW50ZXJydXB0ZWRFeGNlcHRpb247ABBMamF2YS9sYW5nL01hdGg7ACFMamF2YS9sYW5nL051bWJlckZvcm1hdEV4Y2VwdGlvbjsAEkxqYXZhL2xhbmcvT2JqZWN0OwAUTGphdmEvbGFuZy9SdW5uYWJsZTsAEkxqYXZhL2xhbmcvU3RyaW5nOwAZTGphdmEvbGFuZy9TdHJpbmdCdWlsZGVyOwASTGphdmEvbGFuZy9TeXN0ZW07ABJMamF2YS9sYW5nL1RocmVhZDsAHExqYXZhL3RleHQvU2ltcGxlRGF0ZUZvcm1hdDsAEExqYXZhL3V0aWwvRGF0ZTsAEkxqYXZhL3V0aWwvTG9jYWxlOwATTGphdmEvdXRpbC9PYmplY3RzOwAHTUFSUVVFRQANTUVOVV9CR19DT0xPUgAUTUVOVV9CVVRUT05fQkdfQ09MT1IAFk1FTlVfQ0FURUdPUllfQkdfQ09MT1IAFk1FTlVfQ0xPU0VfQlVUVE9OX1RFWFQAFE1FTlVfQ09MTEFQU0VEX0FMUEhBABVNRU5VX0ZFQVRVUkVfQkdfQ09MT1IAC01FTlVfSEVJR0hUABVNRU5VX0hJREVfQlVUVE9OX1RFWFQAEk1FTlVfTEFVTkNIRVJfSUNPTgAXTUVOVV9MQVVOQ0hFUl9JQ09OX1NJWkUADU1FTlVfU1VCVElUTEUACk1FTlVfVElUTEUACk1FTlVfV0lEVEgAEU1haW5BY3Rpdml0eS5qYXZhAAtNZW51IGhpZGRlbgALTWVudSBraWxsZWQACU1lbnUuamF2YQAZTWluIG11c3QgYmUgbGVzcyB0aGFuIG1heAARTW9kZGVkIEJ5IEtpbm9jcnAAEU5VTUJFUl9URVhUX0NPTE9SAAJObwADT0ZGAAJPSwACT04ACE9wdGlvbiAxAAhPcHRpb24gMgAIT3B0aW9uIDMAGk9wdGlvbnMgbXVzdCBiZSBhdCBsZWFzdCAyAA1PdmVybGF5VGhyZWFkAA1QQm9vbGVhbi5qYXZhAA1QSW50ZWdlci5qYXZhAAxQU3RyaW5nLmphdmEAElJBRElPX0JVVFRPTl9DT0xPUgAOUmFkaW8gQnV0dG9uIDEAC1JhZGlvQnV0dG9uAAdTREtfSU5UAA1TRUVLQkFSX0NPTE9SABhTRUVLQkFSX05VTUJFUl9ORUdfQ09MT1IAGFNFRUtCQVJfTlVNQkVSX1BPU19DT0xPUgAWU0VFS0JBUl9QUk9HUkVTU19DT0xPUgAIU1JDX0FUT1AABlNUUk9LRQAHU2Vla0JhcgAJU2Vla0JhciAxAAlTZWVrQmFyIDIACVNlZWtCYXIgMwAlU3RlcCBtdXN0IGJlIGEgZGl2aXNvciBvZiAobWF4IC0gbWluKQAbU3RlcCBtdXN0IGJlIGdyZWF0ZXIgdGhhbiAwAAZTd2l0Y2gACFN3aXRjaCAxABJURVhUX0NPTE9SX1BSSU1BUlkAFFRFWFRfQ09MT1JfU0VDT05EQVJZAAhUZXN0TWVudQAIVGV4dFZpZXcAD1RleHRWaWV3V3JhcHBlcgD0AVRoaXMgaXMgYSBUZXh0VmlldyBub3QgZnVsbHkgaHRtbCBzdXBwb3J0ZWQuIDxiPmJvbGQ8L2I+IDxpPml0YWxpYzwvaT4gPHU+dW5kZXJsaW5lPC91PiA8cz5zdHJpa2V0aHJvdWdoPC9zPiA8Zm9udCBjb2xvcj0ncmVkJz5jb2xvcjwvZm9udD4gPGZvbnQgc2l6ZT0nMjAnPnNpemU8L2ZvbnQ+IDxmb250IGZhY2U9J21vbm9zcGFjZSc+ZmFjZTwvZm9udD4gPGEgaHJlZj0naHR0cHM6Ly93d3cuZ29vZ2xlLmNvbSc+bGluazwvYT4AEFRoaXMgaXMgYW4gYWxlcnQABVVURi04AAFWAAJWRgAGVkZGRkZMAAVWRkZGTAACVkkAA1ZJSQAFVklJSUkACFZJSUlJSUlJAANWSUwAAlZKAAJWTAAFVkxGRkwAA1ZMSQAJVkxJSUlJRkZGAApWTElJSUlGRkZGAAtWTElJSUlGRkZGRgALVkxJSUlJSUZGRkYAClZMSUlJSUxGRkYAB1ZMSUxMTEwABFZMSVoAA1ZMTAAEVkxMSQAFVkxMSUkABlZMTElJSQAHVkxMSUlMTAAHVkxMSUxMTAAEVkxMTAAFVkxMTEwAB1ZMTExMRkwABlZMTExMTAAHVkxMTExMRgAHVkxMTExMSQAEVkxMWgADVkxaAAJWWgAqVmFsdWUgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIG9wdGlvbnMubGVuZ3RoACFWYWx1ZSBtdXN0IGJlIGJldHdlZW4gbWluIGFuZCBtYXgAC1dlYlRleHRWaWV3AANZZXMAWFlvdSBjYW4gYWx3YXlzIHNob3cgaXQgYWdhaW4gYnkgY2xpY2tpbmcgb24gdGhlIGljb24uIFJlbWVtYmVyIHRoZSBoaWRkZW4gaWNvbiBwb3NpdGlvbi4APFlvdSBtdXN0IGVuZCB0aGUgcHJldmlvdXMgY29sbGFwc2UgYmVmb3JlIHN0YXJ0aW5nIGEgbmV3IG9uZQAqWW91IG11c3Qgc3RhcnQgYSBjb2xsYXBzZSBiZWZvcmUgZW5kaW5nIGl0AAFaAAJaTAADWkxMAAVaTExMTAAGWkxMTExMAAJbQgACW0kAE1tMamF2YS9sYW5nL1N0cmluZzsAA1tbSQABYQAKYWNjZXNzJDAwMAALYWNjZXNzRmxhZ3MABmFjdGlvbgAKYWRkRmVhdHVyZQAHYWRkUnVsZQAHYWRkVmlldwAaYW5kcm9pZC5pbnRlbnQuYWN0aW9uLlZJRVcABmFwcGVuZAAOYXBwbHlEaW1lbnNpb24ABmF0dGFjaAABYgADYnRuAAdidWlsZGVyAAZidXR0b24ACmJ1dHRvblZpZXcABmNhbmNlbAAGY2FudmFzAAVjaGVjawAIY2hlY2tib3gACGNsb3NlQnRuABRjbG9zZUJ0bkxheW91dFBhcmFtcwAIY29sbGFwc2UADGNvbGxhcHNlTWVudQALY29sbGFwc2VTdWIABWNvbG9yAA5jb2xvclN0YXRlTGlzdAAGY29uZmlnAAdjb250ZXh0ABJjb252ZXJ0RGlwVG9QaXhlbHMABmNyZWF0ZQALY3VyQ29sbGFwc2UAEWN1cnJlbnRUaW1lTWlsbGlzAANjdnMAAWQABmRlY29kZQAPZGVjb2RlQnl0ZUFycmF5AAdkZW5zaXR5AAZkZXRhY2gABmRpYWxvZwACZHAACmRyYXdDaXJjbGUACWRyYXdDb2xvcgAIZHJhd0xpbmUACGRyYXdSZWN0AAhkcmF3VGV4dAABZQALZW5kQ29sbGFwc2UABWV2ZW50AApleHBhbmRNZW51AANmJDAAA2YkMQADZiQyAANmJDMAA2YkNAADZiQ1AAhmZWF0TmFtZQALZmVhdHVyZVZpZXcABmZpbmFsSQAJZm9ybWF0dGVyAANmcHMACGZyb21IdG1sAAVmcm9tWAAFZnJvbVkAAWcAA2dldAAJZ2V0QWN0aW9uAAlnZXRCb3R0b20ACmdldENoaWxkQXQACmdldERlZmF1bHQAEWdldERpc3BsYXlNZXRyaWNzAAVnZXRJZAAPZ2V0TGF5b3V0UGFyYW1zAApnZXRNZXNzYWdlABNnZXRQcm9ncmVzc0RyYXdhYmxlAAdnZXRSYXdYAAdnZXRSYXdZAAxnZXRSZXNvdXJjZXMACGdldFJpZ2h0AAtnZXRTZXR0aW5ncwAQZ2V0U3lzdGVtU2VydmljZQAHZ2V0VGV4dAAIZ2V0VGh1bWIAEGdldFRodW1iRHJhd2FibGUAEGdldFRyYWNrRHJhd2FibGUADWdldFZpc2liaWxpdHkAB2dyYXZpdHkABmhlaWdodAAHaGlkZUJ0bgATaGlkZUJ0bkxheW91dFBhcmFtcwAIaGlkZU1lbnUABGh0bWwAGmh0dHBzOi8vZ2l0aHViLmNvbS9LaW5vY3JwABxodHRwczovL3lvdXR1LmJlL2RRdzR3OVdnWGNRAAFpAMD2A2lWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFnQUFBQUlBQ0FNQUFBRERwaVRJQUFBREFGQk1WRVg5L2YzLy8vOElDQWdXRmhZbUppWTJOamJvNk9oSFIwZFhWMWZYMTlmSHg4ZDNkM2VIaDRkbloyZW5wNmUzdDdlWGw1Y0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCMzlieEtBQUFCQUhSU1RsUC9BUC8vLy8vLy8vLy8vLy8vLy8vLy93QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZ0d2aTFBQUF1QjlKUkVGVWVKenRYWWxpNDdpT1RDVGU5LzkvN2FJQWtwSnNPWEVTTzA2L0hjNTBkdzVibGdnUU53cHY3Ly9mMXR2SDY5VzM5OXZyLzhjRGYwTDAvOC9NOEwvOWtOOGsvUDhuUnZnZmZiZ0hVZjcvQVIvODd6M1ZVMmovdjhzRi8xTVA5R1RhLzA5eXdmL0tzL3dhN2YvWHVPQi80VEZlUVB6L0hTYjQxeC9oaGNRZjY5VmI4TFAxTDkvK3F5bS9XNi9laXUrdmYvYldYMDN5cS9YcURmbm0ramZ2KzlYRXZyRmV2UzNmV2YvZVRiK2F5cCtzVjIvUFY5Yy9kc092SnU5ZDY5V2I5S1gxVDkzdHF5bDc5M3IxUm4xaC9UdjMrbXFpZm5HOWVydnVYZi9JamI2YW5OOWFyOTYwdTlhL2NKZXZKdVFQMXF1Mzd2UDE5Mi94MVRUODRYcjE5bjIyL3ZvTnZwcCtEMWl2M3NLUDE1Kyt2VmVUN21IcjFSdjV3ZnJEOS9acXFqMTB2WG96YjY0L2UyZXZwdGpEMTZzMzlNYjZtL2YxYW1JOWFiMTZXOC9XWDd5cFY5UHBpZXZWVzN1OS90NHR2WnBHVDE2djN0N0w5ZGR1Nk5YMCtZWDE2aTArcnI5MU82K216Uyt0VjIvemZ2MmxtM2sxWFg1eHZYcXJ0L1YzYnVYVk5Qbmw5ZXJ0SHV1djNNaXI2ZkdDOWVvdGwvVTNidVBWdEhqUmV2VzJZLzJObS9qL3VsNjk4ZTkvZ2dGZVRZV1hybGR2L3VzWjROVVVlUGw2OWY2LytPUC9XeTltZ1JkLytuOEw2NlVrZU9Wbi83ZkdlaUVSWHZmSi82MzllaGtaWHZiQi82M2plaFVkWHZTeC82M3I5UnBLdk9aVC8xdG42eVdrZU1Wbi9yZHVyUmNRNHdVZitkKzZ2WDZmR3IvK2dmK3RqOWR2MCtPM1ArKy85ZG42WllMODdxZjl0KzVadjBxU1gvMncvOVo5NnpkcDhwdWY5ZCs2ZC8waVVYN3ZrLzViWDFtL1JwWmYrNkQvMXRmV2I5SGx0ejdudi9YVjlVdUUrWjFQK1c5OVovMEthWDdsUS81YjMxdS9RWnZmK0l6LzFuZlhMeERuK1ovdzMvckplanA1bnY0Qi82MmZyV2ZUNTluWC8yLzlkRDJaUUUrKy9IL3I1K3U1RkhycXhmOWJqMW5QcE5FenIvM2ZldFI2SXBHZWVPbC9heGxqdk1IeXdadFgzOHpWZWg2Vm5uZmxmMktCNERWbHE3Uld2RFI5WVdOS3FaVVNpQlgrQ2k4OGpVeFB1L0Mvc0h5ejF1cDFXOHV5NEMrdEZueEQ3R0J0YmlYOEJTNTRGcDJlZGQxL1lIbmpXeTJsMXBRS0hmbllXbGJyUXZUSC93ZW1VRHFuOG1weDhDUkNQZWVxZjIrWnkyKzlJUkZmYXN5T2hmOUsvNEg4NmtoOStuNVZZSUdWbElOTk5ieVNDWjVDcXFkYzlNOHVFMEtvalhRK05QMnF4M2tIelVGOVVRRVEvaTZtRmtVVGdETVV2NExZWU5VT3N1QkZ0LzhNV2ozam1uOXZrYTFYaWZhRlRydFZJdUtYVldpOTBzbk9kTFJMZE00Ulk3QVVXS0grTlRNRi9hdGRwTitBRFVRcWFOZGU1Q2s4Z1ZoUHVPU0xsOS9yYWxqNWhZNjhzNHBsUEIzdXBldDFxOG0rZy9LdmxjamZFc3dBQytLelNPQ2x1aHJRTGJSV2ZVaU9KQWZSbi9oSTUvb0tPZkI0YWozK2lpOWRCbEtlLy9XMThiblZnNlNyeUhqaUErY3lXWHhFL1pJaWFRUExCc0FLY3ZQcjRBc1NlN2dZSGJpR2YwYmZzUUhnUTgwa0NteWkzNUUyK0gwbWVEaTVIbjdCbHkwKzl3WVM0QzNVQkpFOTdMbXUyTW1ZZCtUaU41ajlHYTYvV3NZTG1QU2EvaUYxUU01QWJNUWFsWmlKbklUa2xIV2tKSWhqbXZmQldpVmFJSlVTNlIzdHQzbmcwZlI2OVBWZXRZejNVTXNrOE9sb3JrUFBpNFVIQTg3bVNBNWZ5eGIyMzZKRUxMREFaL0tUWUxjcGw4cnFnNjh6MVFocGtiZndoaWdoZmVNcnNRWkpGb2VJRVM1RlY0NGwvT2FUUHBoZ0Q3N2NhNWFYVXhoU2NwblB2ZW9DbnowNFRTUnFaQWVRMUdhMmdGelh3OFh2VG43NXlrSDJDWEtFZUlsTlNMcWdhNzhwQmg1THNjZGU3UVdya0c0bXpSemcyM0h3amowNkhIdmlBenIyamRTMXM2TGZ3Umd3NzludGh4eVBtUXo2Yjlqek5UdlNBY1J1RVo5Smw3Yk1Bci9rR1R5VVpBKzkyRzh2RTJxQmNaWWNxMmFpaE82a1ZtNjFPa1pJYXlXR1BDdzczYzE2T3JmT3hVWmkvcnR4SFIvZ1VhYlV5SDJFaXdFZDgzdGk0SkUwZStTMWZuZVpVT2pVazFxSFVzZmhacytldzNvNnRrUyttaFpubjR3NHh3WTlxd1Y0L2NYLzNJMDN4ZEtIcGdDL3d6ZitMSnQrSzJ2d1FLSTk4RksvdWtJbDZRdVBuTDE3c3VHWXZwRHZxUkc5cmNUdUZFaFA1aHFIZEJZVkUzeTVSOTJDSjQ5dzFVbStiZzVtaGM2L3hBS1BvOXJqcnZTYnF5YXg5ZGkzWSttdjJhUmZOTkVZcElDdXo1SGNmT2ZZSUVRZ3Z6M2NXRGVWTkEwTGZrUGFpR1RSdXJpWWZzVW5lQmpaSG5haEo2N0xSRTdKbXFuTk1sMDhPVVRwd1Fvczl4WHBkN0wrb21acmNFVmMvd0V5LzNTUitibDkzU3lpeFdRUTFsOFFBNCtpMjZPdTg4Umw5cGFhcjhuT3BOM1NBL3FJNU5ISmg5eUhjVWZHZ1dQaWk4Si82b21zYVRQOVRFZzlycGpMTXo5VDFvTUk5NkRML000aVRXdFhkdkxGOEdNUkFEb1RtYk9DSVY0OWEyUG9mMFJxbjM0U2pkTUgvakpKU3dyWjFhY25qaDlEdWNkYzVUZVdNVFZ6L0lia1BJeDkvaEp4ZWZJQnM3VXVGbTlRM2JWeU5QOTM2bmhNdGZuaVkyb2VETmorQlE1NHpFVitZNWxtaDFlWGxlUnMrT3kzbXJUaS9DeFpaUEFEdFB1OUdxNFFWYnU0VFFRS05kY1hrQlI0Y21qb0ViUjd4RFYrWVhsa1hpUjN3ekU4Q2V6WlZHTFdpcGdnUkdoOW9uNzdVbEQzcDZ0YWZXSmhtQnJ0eXRab0xPYXA4Y0VIRU8vdjAxL09sT29SWGtucWM5akYwU0pIdkpXR1FDQitFTU52UldQN1NpcWQzN09QN0pjcUhaL3JGUDRCQm5qcTgyR1JhT2RDRHRYVGRqRDlGUkw2amp5OFhDS0hnTWovci82NXArMWtCYmZlcEMraVJNU2U2NU1UUmYvN0RPQWQrL2o4MXdqK3VCVEkySk95RERyNk9hYlhWR2dWYlc5VDF4VElKL0phN0RPRndNc1o0SW5QaG1XU1hVWHFpN3RQLzdoU3lQWUNLMER3azdkWFhsV2orZGIwdVFZWUszREZNWmtxVC9SSFg4d0FUM3N1WHA0dHZ4SHM2NkkrUmR1ZFFLaUNsMVRtOVJWc1BQLzBHUUlJQ1pLTC9JSHlWem5ncDI5LzVqSndwMmFWL29KWXI4c2NDdEFTRDRndnE4K1dGZXdXOERQOUwxU2hEbE9FUzRpaVJpNWFrU1h3TEI1NElRTTg2WWw0K1pKSHNJKzlhaHorYk1VSWdMLzNnb0xNeTFWMzJ0MXdkdHBaK2grdGhhU211aHlvRFZvc1IvdTg2UERMR09CcFQwUXJPYTdPWDZTWVkxMWNhM0VWVGxpaFZGOU9mVWlvdkxzTEgrVnVGN1pZTmRtcDBrWkUvMWNrcnExMVR6TUdYOFFBejNvY2VINU55MUhuSWk2SWZtdWxwaHVSNE45SnVINjZhcTY3NzN6U2RQcnBSbU5GbzBIZ0tLQVpyMFRVUXQyd0dCNncvc2NZSUpEUVZGeS9wUjNaK1M2alpVZHFQclNOZjZKWEZ5c2NMVHRmUWZCS1B3eTFGdVFEa2Nic1JjYU55SiswZlZaTTRDVU04SnhINllFZnNmMjU5anBuanZHdVhPN3hHNW4yK3hiYVM0OC9DQnlLUXZjSWtkc0YzM0txMnk4elpKZHo5ZXBDRDFrdllJRG5QQWlKUzllTDk2UnlsN3g5elZYY3l5OFhYMysreWlVSHBNQnVDWGt2Q3EybHEyNGhqSGFWTjA5YURXV3FmNHdEdnYvR0o2M1M2Yy9xM3Nhb3BJeGY2VjhydUx4M21TdExKSkI2SW9vMzVXTG1Pa1dueXloSE1WSXFvRnQ5VXREeWx4bmdLYy9BVlZXckZHOUQ1K2VVZThGUGZ0YTIvV0JkM3hGNWdyNmhJaVZhVGx1UVA1aVYzU3lGU3BhdGJhVThKMlh4UDhBQVpQeHRqZm9XTVIvRWU5VmlueGhIKy9hNkZnQzBXaVBMMEpBRndIZWVJdGt3aTYzVEhZQWhzTFlucGF4K2xRR2U4UUJtYUgrdTlVV2VIMVlnYVlDL1NYOS9acEQ0Rm1QdzBaSGZwNUdyanFVUi95YnZ1K1lQa1o0bkd2TVVlZmFMRFBDRXUrYzZtdEhNUzU0ZnlHKzU4Qy8rUWZJZnVrZjNLK1JJcG45eWhWelhaVTAxY2MxNlRMRTdCQjUrYmE2aG13YVBmYlJmWTRDSDNuVmZNSjFWei9Fb215MUgvR0UxUmIrTHFQeWhkZU9PWE03Sm1OVGFTZ2UvTEhUK3N3YThnSFZTSW1nYUtUYmR6Rk5DbWY4d0F5REJ1MHFIbDhvZ1A1bExKQkZVL252RzM4ZXJFcW1UVDJRQVZvUHVGUnV6WWo1V3VudXh4VEZibHlma0JuNkpBUjUvNDIvVmRnU2VCVVcra0FHSUJhNzViOFI4djdMSUJGeHRDTEg1NEJZMkJCWlZHL0NsbGxXU0FXVHJnTE9OcVk4WGJML0NBQSsrNXpmcHN4eHdQTTdSd2RjUkRWMHEvNjNBejEyTDZLclhaSklsVjVDWW1XR21VaTNSQW9PbXh3RUQrVGZTU1BwdzhmWUxEUERvVzBZZWJTQXljcDAvbVgySklaMlMrWU9xLzVObGluOXJtankvcEcyR0M4QWViUXprQUtLaXhUWitGU2s4dlR5SHZmOUJCZ2daRFhVcjQzWXA1SDRpOS9qcjl1Z1BNbHVQMmZPNmRvQW40MGpZQjUxU2RtTFh1QmdGc1lqWXU1alpPdkNVTXFHbk04REQ3N2hhTHZiaU5sOTAxN1lRdWU2M1BCYVpGZmhlclpWYVN5a3Q1cjVpcE8rRER4NFlRQTg1a2FaV0VnRXErV3pkS3RVTWtzanFMUTJRYTIvYzVxS1ZlMGFOeUpNWjRLSDNpcTBvVnJCNnRNdXdseXpYenlnZHk4Tk9xZkdrZ3JrNjB3cXdrMFY5QmxEQlFSdjh6YURRemlKWlJ6eVJpRXUrejN6MGFXOCtyN3BVS1YxaTJBQTBNMHA4a3d2Wk9EUFE2RG1mVWlMeVZBWjQ5TTJhSkRXL2REQTRlcHBDUkMrL2N1RXhmckx4SlVPeDJBejg5MERMMFArK1ZvQ0tCZnJqVWIwQkNDa3JVQk1zZkVoWHUvcHRKSWxTMFRDVWZhYkxkSTlXa0ttV3BmZXh5OEdQS0J4NlBHYkJGem5ndFF4ZzBzRDA0c2hmREo0a1l3Wm1hL3hwNHB4SW54Z0hXdWQ3c0gzTndCR09rVkZISlAzOExTNnNCUjFEcWpSTkQrUUVtclJYTm5mMDZjeFZEYVlpUXZBRVQvZUpEUERvV3lWVGVVSThyS2o0ajZ3elNWcEg5NFA2S2RSblF0QWpuL2hGVUY4allCODFPWW5oZmdjZHZKRDZ5bVQ1S1JKb2xxNmg5d3pRRzhha1hoVGlvWDM1K3ArdXB6SEFRKy9TUVArei9TLy9DMHkvZG1qc2I0QnAvWjRFOWlZMEJGcVVUVDlzRWdiYUF3S1NYeXREUVEybzg2WWlCcWgwSlk1T0VSWnUxdjFKNVM4NStCWEo3elJLUmg2My9na0dvSWZPYWgwWXZ1TjBBTXdyMGZtbEEveGxFOW04K2VKUVFBYTgxd2UwREpBb2lNQUN0ZTFySVJ2dm92RjJjVWt0dWFtVm5FRTBNazg1eDIwTldpSUM0SUFuRkFvK2lRRWVmSmRrQUV5dy9nbm5EQVdBNG5xeUNUNW91enU1R0ZsMkVmeEVKc1FqVzhXOEFjUzhBdmlYdjVzTG9xNXZRVnFDb2lML1JuRE1PcDVKejNjdjRnOVd6ZzYra0FPKzh0TEhyaERWQUdZZnh6ODd3VlZJeFpMZmRyK1A1SUViNVJnZGluSDdIbmFQNHJJamVML2FPNjBCZkh4VEpBTHl1dHBsZFc0ZFEwajZrQUxWdjFwRTl2dEVibWg2WFVqNEpRekFEMjRId00vQWM5WnNBNklVekdwZ3ZkMnRBMnBHL29oSGVUenVIbzgzbkN6ZDFkMjlQUVVCUDFKRldkTTVsempYQUtYdWN5cWs1NGxQdm84Wk5TSVB2dU1uTU1CamJ4QzFuMm9PWnVnVEhCQTdWM2xaQVBiWW5MYjNlR0crUk12dEFrOHRHeklvN0YvalBVS2dvbWRRdWRyb2FPdGxSWG5naExSYnA4cVR2OWpYRFhCOUhxNEZIczRBajcyOXBrVXdiaE82Y0VvUy9DSkdmc3Jra01OQ2RqRjhaTXI3V2dRVzhQbVFYT1MyRXdkODNwWVEwQVdhdENJcjFNSHlpMG1OQjV5MnJuQUFtbDY0MmkxZ2VFRjZFUWU4aGdHYUhoT2FOSmNBSzhIM2R0VUpDa2pPaFhGZlJLK2Z4R09NSjVXTUJpTDgrcGVLQmd4TTlrOExWQ0p1cDlnMWVTUTVBU1hyNVB6M2JvZWxhd0R1ZUVQbTB3djZuV3F2Y1FYdmZ0MGpWeDF0MzhNSlZCMzBLU1laM09kUVZwV3RLNzRrTGc0N1ZOTjdNdk94Wi9RbU12cCtzV2JBWjVWeStsalhsRXhPWTdWWnQxRGcwQ3hPdUYzTnM3K08wTWN5bllFQXovZlJsdUJER2VDUk40WUdpYUg0dXgybytFaVE4dWRXUUlSUEM3UXVSMHNNei9vaXJWQTRxSWVBYlVCOFpRRTQyQy9YQ3dTTHUvM1FHUFE1RzNwZHlyRWk2NDhvUXQ3aXdMUGRmY0FlSUVTRTJUUndpajlHRy9uNitxTU1JTlcveTM0WFZNL0NrQjFvRVF3ays1QlVhSWhaRHB2eEpraVZjUFcxQmJUWjBRdmR3N1htSGFzd3AzN29vQmFnQStiVWRBd2M2U1N4dHRQLzY1eEoxcjlCNXFuQ21xbnUwZVh2RDJTQUI5NVZjT3Q2TVoyMTk0TDFpVjB5ckM4MWIrcXV1UklZd2M2UmxQU29GZ0kwN0d2YVJBdVBJM0lmOEY0aDk5WEVIS3h0eGVFcEhaZUdiOG1BZmV3RE9tQmhaOEQ3b3ZXRCt3Yi9JZ05BaU83alA4dlMwd0JxMng0dUNVN0crN1FEQWpBWUIwZ21BZkdQeTlxK0NCYnN6VGhXM08zMkswajhJOWxmSWxIZThiUGsyTE5CeTM0TmUxQUQ2UXAxUXNHcEI0TUtQb3dCSG5kTHhYVkZ1RHNISXhLOFR2OFllTXZ0RGZxK2UzY1k4UjRRN2dNcUdBYUN2QTRncExKWDkwR1F5amhIMUhTUjVEL3BBVHlicS9iaStPOVVBRlFlMnNkZ0NUNDhKUGdnQm5qWS9aaGlwN0NmK3pER3VFcGQrS0xaRDFpbEdWaUFsVXl5anJ3QXhJNVJMcTRmb2lxL1c1SnJIUHNzdDBOMzNpSnFIS05wdWdqbGRYVWIxTlVsQStCWnMwYXJ5QnRHSDMwekIzcHIvVEVHS0hhbVJmWWMwS0ZmdWpKZ0lOaFZ4ZUk5Q3dCeStJQUVDRE9RWjd6OUhCL0dZTXBZcWlnSit2cDJtN1NnWWRIZWZLZkpVT25SMW1CTDA1QlpTQWpQOE0rbENtQVJRWDRSK1FDbVJQM2dpT0JER09CaGQ5Tll1RitlZzAwWUxrTVBvSUJPTldNS0Vjb3BmQlVTSzB2MTQwRU1wa1duTjl2VFJuSTMvSmZ5Uno3eWNMcWJsRElWNVI1QnQrQlNYaE1IZzFwZUo0K1A4TWQ0WklhVlFob3NNVERhZzdNQ2Y0a0JtaDc1OElNY3ZESUU0R21UTjlqSTdDdk9hakwzR2dRL1VldGJJLzdHRW8reWpMcU1QaTk0R2RQRDc0MGxtOUNraWZVbUt6WWtzbjNPSVdFQU1jZThVMUZxbndlWUZ2RFFmenlxdkxHTDg5aG93QU1ZNEZHM1V1MHl6c0NSL2tlM3FFOTBSQzJGczRpVFZjd0pHR1VaUDFxY00yYUlXU0I1SUw2MHVlYm81cS8zUkJVWnZYTEYvZDFTUmV6TzBjdDhJSXNGckt6SXhuUGJ3MjJpYjdPQmdDMUhRbzgwa3pyRG4vL0Irak1NVUxVTTZGNHVqTUJMQmhBam9FV04yaEJ5cFVudVd6UlovVFRWYThqQzRzM2VVZ3NlclFJcFl2Q2psckFzTk1KbmJOYVlBVkRyY2VNRlBnTkJ1SkVPb0R2UEFtNllXdTk3dm43NnpSdUFieEcwZld5QTQ4Y004S0Q3S0habVF2WkhZTHFFVzc2RXYwakZMaFpEWHhlZTlmcFRhTGlRSWxOZld5Y3dUaDZublQwTXRnTzVndGh5aEZwOU5rdVdJMWtRNkplellzWXlaTW9aWXZqa25TYUhsZU9ldHJncjkyZUV2cm9lQUxDNExUVzZCOE5JL1pBQkhuUVh3YzdTdjJYSEFGZWhzZkVESkFtMTQzR0F5MCtEUG1SQkFuSWFCU09JSmRYU01vOTZGWmxTUzA4NHc5TEUrR0ZZNVI4VmxabmNQZFpiNFVDVG9RTUNtWUlSZ1g3ZDAxejY0b21ueEpzc1FhK2s0MS8wcjlxQnY4TUFqSTB6QzZNT29tOWR0bDNZNndlUUNFTmc5YzlQUDg2Z1kwdzM4Z0dzR25Ub1paazVBNG93TlJBZEVIL0pnbGsraU1rVlFiSllicG1CaGl3NVVnL1IrWVJ4SnR3V3ZGb1UvODJ5NEdWa1EyWldyQXVFTlFjZjc3ZEk3MW8vWW9BSDNVUHE3Ukh6VDZmM2R2cVB3aEhWUWpnMDVLYjlNT1JySUh1VkdKRGtUVXpSc3dCMUVrUnVzWEZ0dXVwMUpZRjRBQ1hjdDZjOGVDdWEvT1lnQ0JMampsd1hEWXV1MWN4QnJsajBKdVEyQWJnM0JCRGtJR2N3UlAxUnF1RWI2K1VNWUxvRnREM3M4UGVQdTlDWGxXNDZ0RlQrc0hmT0ZDN0lFb0JKMDBRTXJUUDF5QkhGNFBqbjRxR1FtbWlHZ2I4dHByNkZVMVZncE9tYmxQWU5PZ1V5WVYyekNwV0tiRmxBcTdoOUJIeW5BZVpoNkZ5aFkweXUvZWl4TDljUEdPQXhOd0FENE9qeFRUNVlqa2VpaXdYNW1jNC9zb2Q5YURBaTVrVHZJbFVvdlVRWElvWVR5aWJHdU5mSXZScmR0RlVUOTF6Ylk0YWZSM0pYN2RaSHR5M3p3OG9DalFEcjdzSFhLNjZmTzROMndlaCtMeGp3Q3d4ZzRrNzE3UmhnUHZKZ2hSNFY0VTFiMVNULzE3aWdnelB6Z05uTnBPZlM3a1gzYUhKc0ZaTFpjWHMyK1d0cWYwOUtqTUt3WmwvVXRRamlqbVlsODR2T0EvZW11Ukh1NkdhT2prWHY5UHlWSkpnSGd2VUFnc2hmNm9uNGRIMmJBUjd6OFRDYXRxZGVMeGhBSGxvZFpZUGVZUU9HcjdaUEJ0UVQ0bU5nOXZOUDRBY0FmUUNRNDY1bkVpdE1NNGNVbzBwMmk4OFJ0UXByRFBMaFFsSG5XVCt5QWpUUHJ6MjVNNS8wenRWWnBOakY1Vk50ZHd3S1RUZUpyTWNIVndhOGxBRzhYZlZSMk85MllEdjUyNkp6YWxPWTRKcnRUcmVvRncrMTFnb1g0dlppVVdTU0haRkxBM1pxVnp4dTRCckNEUEJhZ0YyWEVhb1ZQNXprRmxudzV6QWxHR1RHdzBHdjhwSys1enQ3a2NzME56WVQrQkFJM1VtQlRScXNTNnp1c1dObnY4a0FEL2xzQmdDYVB0OUZIUFNVSGRBaE1oL2Z4QlJkdUM4TTZFdWhGN1BacFhyc0FCUGRWNWs1WXZPaGlnQ1ZIV29GREJGbVVTeURBZWhQSjdvai9XRnZPQU1rMFRsK2N4a0w0bWxtdThkWlI0cnprdmpuc21DY0VaVkNibC9hNWMvVzZ4akFSTFhKdHJNTkdMN2hPQXFvQ3hUMUgycXB2anFieUp5K0ZYYWRIOE5qbzNNRk9DL2dSYnpZQVR6R1dRR2lPVjRWanlOR0N5MU9ScjFWdTlBOFlBcndlL294MHZtblhlb29Db0RoY0VnSzg1ekFaZnR2MmNkNU5nVzRmWHV3Qk9hWFlDSDdGaCtMRy9BdEJuaklKeHN0Z25EYS9KZmk3L0FkWGtxeXV1R2R3UUVsMkVkRlJIVzMwKzlZZ0FGaE9BN0g0M3FaWkNWSjRtZUZMWEJXUUJSNEJrRkRsc0xxWmRlOXBSUERrd1cxdGtqZm41V2ZnQUZRcmo1c05WOWJMVmx2TVlaZFlJdS8wV3JqOEJPaVgyNkhKanZ3c1RXdkwyT0FPRVkvRGZkcnVWajdZNks1aDByajBlVTBaVS9TRnIxekgyVklVQ25FQ1ZVMXdzYWNzdTNTTk4rcUh6SUp4NjB3Si9Tano3ZGhzM0ljaVV1cmJhalpQU0dFSWMrUlkveVJpL3B6cjNOWFoyR04wUko0L3VUTEVCYnI3cWZFV1NVOWR0N29OeGpnSVovTE5VQXNBTFE2SS8reWpKblFxeUREcjlZbUk2RWp4VkJ4aFRRQ1VtKzNHQUJkdUVnWE1hNjBMZXluNXo1dWJQMXd4RXpEWjVJTzhFQnFXVGdoaTB0a01oaEZCeXk2QU9ldG5idzNTZUhpYW11VjhvQmRHUHZxT2RldExlVDYrWGNDWTJlSXJEblpXOG1tNzYzWE1JQnhISE1aZldBWHNiQnRCeGhEajlPMUMzUnV0Y0lTcEE5SzBEa1JnYzZpb3daRmhsdytrTUZucm5KdEQ5ZWRNc3VoUitmMkpwTC9CMVRDQUIyUVUwUUpHdDdxeUk2UTJreFBQZ0NZNU16YkZ5Z3JKUnA3N1FMK0lzdXpZd0NXYlRjWTRFRDRhVHFxVWg1Ykh2aGxCbmpJcHlJVk5odWhsdVdDQWZiK0VBbit6QTNDOE9SMDN4VkU2M3pXemRGbVh6dmtSaUFHdEl0MFVEVVVCK29xdFpZaVEvc2g5YkU4VnloaWZJZTFIY1EzcjNTZHFDUVliL0ppa1QwNDhjbE41by9vbmw0dlo4WGluMTNSZDJSQ2JqSEFCUk93TlpLRGUyenAreXNZb05xTEZQQmhWMFk4cUt0cUp5Q0tvcjYzbDlWRUh2M0tEdHRZL0ZWb0tPOVJzV0k4cjNLSTNnWG9BUTQ2cUh0U2lJYTdOaU1uOER0N2dXRXg1NEcvTjNUOFMxclBCaGI0akJ4L1l3c1RaNXRMUDhFTkxwNlpBREx4N2picE41bXg1VWtjZWJEdEVVUVk2NHNNOEpEUGpQTUVqRWpBMmZsWUdOZUZUajNtTUtKd2JDOU1sMWpvOU92bFVJUnBpamg0ZFBZTEd3aEJEaitINk84Zko5NGd4UjNnUlFhTnlhQlFPVHFsTTc0TFZwVktkM0p0QnBJQlNReVFPTENNWjJNY0tLYmRNUTdRbDFyT0gzMytkbjhzT2dNZ0lQd2JHWUZuTWtBZEViWjFkK0xQRGdDRHF2TVpyejFwT3FKeU9HZkVBSFRNcGxIc0N4dmRTQll4QkRlcVJzbnVqd054Tk4wTkVVUnUvdkFEaG9sQmxyK0YxK2trR3J4RVR2eTA2N2ZpblU2OFIrMVVqQ2ZQTjcvVitkUTk2SzlTYm04ZGpCd0NjWGROajYwTStYVUdNSEhvczRQRGUvQ0UrV2tqZ0wwWTNBY1YxNHZhMmNVTE40S2hzRTVCRTVzQTZqUDhMZzhVN2xFYkE3eHBkaWkrTkZyUWtCaGhnOC9rb1FNS2dIMFh5NTA2a0dBYUJvbTZ0TWVOeEJGTFZmS2h4SFhxNnVFRzlXSElMTXROQnFDcnIrdUFFUnl2WTZzcEZmM1FnUENYR09BUkh4aTZNbCszSU1qMUJuR1FoTThoL0xFdExMRGpFdUJvWkhMUDNnSnd3RmpHNjFYd2x6WEg3WUUzaWgyem43VHVYeTdTSktBMldyTkhabGNHMTlDMVU4LzZOWThzY3J0NmIrVU9ac2x6a3pIcHRvRG05ai9iTnZCSjg5Ny91WEFXOGZabDJhQ2p4czlKRGJXdkFhVjl1bjZYQVF6RHdQWTh3TEIwVG9Ra08vK09XK05VVjZGSGxVaUhWUHMzcDJ3UHQ1RFZMNTFXSFBKOUMwSHFiblgrQmpvY2tGeGg1SmQ1eUlPMks3QmllZXZwMXpFQWRiSmh6cGNKeElKRStqNzRKWkxoRVBtSk1pa0F1NVBqNDhzVlkyUHdHbmNkQjFxM0w4WWIxMjExMGFBZW14VDhBZ004NHVOTUh2YnRaU0pndncra0h6a3J5MVVXbDVzakRJREdDdDh6dGtwakVCZlpoTFJjQ3FFaStjcWd5OTl4bVpDNVgxY0dkQmc2d0ZzSFRISHhBenpwZ0FDekJEcUgyQ0piM1pMcllDVlZaNUljdUVmaUdRMGpkcGRRV0pnOXViVU4zSEg5M0JzRGpGNkJkVDF3QUc1TVAzaG13dTh5UU5NanFMRnJoemlLUHdSd2xhQ2xGYnVjcXRDK1I2TGpWU3dHdlQwMkV1VXQ0c1JTYVlrVCtxMTdySXphVDhvbmppcC8wNnBtSzRPL0p3S240SVpXNW1OSjRwN2NqQkNJRXlLcEpNVlZSMXF4Vk5wT05GTmZMaGpKTjl6bnd5OGZVbG05U2NpOURBREUxUE5UUXVjL2ZNRHlkaDI3TVRqNlNneGFXRnlRdnFiTVVNb1ZDNnhyVnd5dTBiWkhVdEprNlpGdmlBR05ERFhxNnJkM0tTRDZnRVJUbTVsZEh6Tzhkc2M2b0tBQktQTmRLVTdxUzl4U2lvS1JabFFXM2YwcEwxekJxSm1PR2plNmZVWUVZT1RNZHA0OG5WYVhUOTM1Ukt0SER4VDRUUWFvSGZucjR0UWZ1QURPdkkxQS9WREh0UER1WGNPL3RpazAyZUhGaGVBMFVLVFlHZnhSMWd3SmZEaUNkVk8zc1hmcVFRY0U2SUtpK1FlQ1pMVnlyUUhpRUdyejdSeFplZG5aeUJubXkvYmxCRFUzMWZ5VmVCcy92UFNVWU9McUQ1RW92ckYra1FGTW5Fdy9yTjJMY0lCMFM2cHFmSWc5V3FEVTVTYjFBQ29kZXRNTDYwbmhaZzhERE1kenRlMjdzOWQ2NUNmMFh2KzRqcWhMNFFtRzhsTjRlOUZMdlloU3RpUGF4VGZwV2xmTDhGY1JMbXdsOU1KVGQ3aW50S2lvVHlUYmp0aG5Qd1Fra2xNMzI0Kyt0KzVrZ0VkOGxMZWJaYk1QZzA1Tm9CeUxQcUQrdVBIekRxbDVQQkRzS3BCVTVmT3VWRW9yajNZSmdPdUpQKzBZOUFEMFI5YWxyS1BtSk1Db0J4a2hXZWpXc2g4YW5IdEtZTE5LOVJtSkR6c3ltZUtWRkxZS21WM25KeGgwaDF6MWhTMkh4N3RXam54SlZwQ1BoY0w1TFFZZzhUenB1QVgyTm1zQUFSeW51dlRWTTBLd2lVbit6cTV5OXRhY2xDS3ZtTXNDZk9YVWlxNG1xT1V1N05hUGJ6VFl6Q2hkZGxSNG1rQ2lCYzVKa0JZQVc5SFdncU90ZWw1cjNVSzBnYzNRUllEdWtINldDV2l1MWVuQVJXS2xmQklCT2VPRmRiRCt0bCtQblN0MUZ3TTg0b1BNaGdYRVJ0eE9EUWhXZW80OURGdmNWaGcrV0laZkNzZWZpenRSSkU5T0lvLzhhVUFTWEtHUm0ybm5xZm92M2lncWZNbWVvQnNlRnd1TVF5VmtSaU5nS2Jzd0hmKzFsOHZHbDlpbmd1R0o2TjRpNW9XSEdaTktxdzM1MnZqZkgvZVBHT0RacUVGUFlRQ3VwMXFIYU5zWVlNZzhrcEZSYzg2N2c4WnVmbUgvUjJrSkFHREliaXNwTnRqU3BlWnVFRnI0anZHRDlxMHYzR3ZVblBwSlV3ZVlKQkZKSmpQYUI0cnVVcXREZlYzMWhBRythSHJ6UzJ5Tyt3YTdkRXFyOC9FREJ0Z0p2ek1HZUt3UmNBOERQT1J6eWxTT25RRU9UNXdEc0xhV21GclJjd3VtcXoxRkJRSTh1Y1dhYWlnbEMwT1FjTFpBQ3ROQVhucEl5VVFsWXdSRktDUHVha3dpalFOUWlrQmZ4d1hvRG15UnI5c0RYY1hvMFZBb0lRa2dtV1NySjVxb1NZb0RSaDh3d083cnB6UEFGYjJmd3dCaERJTVpzWUQ5QTlQQjViQ1ByVzJDUnU5Mll4ODBCQm9zNm5WYVU3RmZrVEhsY1JhYnU5bWQrYVZsU29iNko1azE4NDFWWXZ3UUNZZ0ROclIyUzdxbnE2cFR1U3grZ2ZDSkJ0SUxONlMrb2Iwb25VUkJMb2t2SitYeTkvOG9BK3g2NDVaVitrSzJoeUw3RGNhZDg3NXRtOXAvcDdiWElyd1BGTjFLOXRoaXJXV2pnUTB0eXlFWHRITThKR0h1RTQ3clpnUVkyQ1ZnTWk1RnBpOGJ4RUN6dzlwZmwzTTRQeEw1SkFkc0YzbHVES3VyeExQMmhnRFk0dVN5TTFsZk1NZTZQaGczN25NR2VNaW5wRjBGNkRwSzVnWmRHM3BGRnYzR2duRlpodEdISUx3TWtaQWZ1akpRSXJuWlRpRnBETDJRZlZzUmhYSDJvaTcvdTR0c2REQlNVNk1vZ0hRQVU0eGpRK1FUUmtRY3NsMW5TRmpkN044MnhtYzJDZUdvU0ZsU0lJdEhYVExBcHZVT1J5TzZ1V25qZHc5dUZiL2lnS2N3Z0xlYkI3QjB1MzlqZ0FEQzIyRGl1dG05cXk2K1pqdmlBSmozUjVZNVdmMGxJUGVDK1N1dWtNdWVVdkZrVTJzUTN5M3NxdjE4QlU0alY5MVZPMG1BSktVZTRBdFVJM215Nm5LZTd1bHkyaFE0bDNtVHJEV2lRM1R2M3FhaWpuSnV2ZElJM2NaMDl2Q1NmNVVCVE5scmdHV2ZMTWRrS09UOWFLK1RNSWM4Zks1SlRoZ0NyQXBaZmpyMlRzc1B5RXNMS010SXRQR0ErTUJjR2NVNW1ITmwvT1g3WldoSDc2WWY4RmE1WTV6OUFJT29NTEwvVWUvSTliRjM3a1BzQmNQVzFoQmo2bXl1MUF4MVhES0EvTEg3bEtnd3hhTlZ3R2NNOEpEUEtEMW1LazlwNHdnRjhkaFV6RkhROE9Lbm5pT3JtY09Da21LeEpQcHJ5enZEUVhOYjc1TEpHaGMwcjBWekFSZ0dyejdpZHJzUjBHWlJnRUd4djVMQmRTVE51UFJuelhzRytNejQ0QkkxcVJjc0RXL25qdmNSR08za3ZWanNaaDdFQlA1OXRCRjR5UUdQWndERGJST2JOVThxZEJZOW9JNktYR3VWd2h3YWdwWmR6U0graFljbkJJUHkvRTBPZHJPYXpvWk9idndZZGZZOGx2MGhSZ0RwN2ZZR1pUMEtjRWozV0U3NjRhQm5ZbHFrdGwwZWlubTlTekFUQy9CNVZocUZoY3dBYm9ETFhKbjcxeXd4dHVEUlV5U2V6d0FjUGx1M0dqa01UTmg4YVBmbTZYQUY3L3BEMnhpZGJNM0tpREJBUzkzNWdkTXQ3ckJoNk9sdmtvYVhXTkZqOXFlaEhTVnNKb1Y1ay90clhBR091YStMYUxJcGxENDNQc2lHNFFKR2lQRVNSM3B2UnNYM0ozMFlRdXZodVhuejFJTkhDTHg5d2dBUCtRVHZkcUc5UmVMb1F3REFCVkF0UklZRHpwb2RIeHdNREF3T1B1eXhHdGI1WnhWekVXb1lJenloWWxMSG5iTVB1ZU9BaUFKWm1tMytwSEZjRjNtL3dwbCsyQ2s3QmYxNWlONHcvZ3hBaXBqUG5WVW5CM3ozNzdyN1ppLytIczhBYjA5bmdLQzNwMXRuT0lqL1pCUnhPTzlzU2xyWEJnT0F5M3U1dHZ1dDdkT21CemtnZkJDZDVrd3JCdk9TRDRDNHkyUEtKZzI2eUhhVmdhT25DUitIcDBGU1F1VzhTd20wVHk5cDIxdGdaRHBCaW96VGh0QjJuTytMUTMrUURIMDl4czg1cmc4WTRERWYwT2FNSkRIc053WWdjd3ErbkhHTnpTUlNyR3o4b1ppYk84TGtxS3M5QS9TMk85SDhWZ3oxWUtHUldTWS9Sa1NhQ05JSHZUTXBJdU43TjVKbmJLRWdCUlZISElEKy92Ump2VXR2cmVFckFKNkRmNlJ1RkRsc3U3a0JPenZuV2pVZy8vbHdHL0R0eUFIUFlJQzRia2JnRU9EeUxRYXBrQlRBSUFqMmxGQmpJL0VTWDBUQWR1VFVMUzh3OXFWZnhQRW5KS1U3Nk5kTnBLNnZyY0NOUjI2blVBQUVaUUVQWWRnZWhEamdDalFsZ2MzUFA1YW8zeEx4TlRzVmxrRUFaU3RzNHdLb0xWQzJhYnlMNDc5K05KZmdCK3ZwREtEbWlPU2RhbHRsOXhiMjNUR09HYnVxYmFvVnVyOEhoUy9rL3FEOU9DSFdPVUY4Vk9SZGlhUDVHWGJJZlN0d0ZYRGRHUUdlZTlTa2FhQS9CbzgxVFNEZm9qODNQaE9wZ0dnOFpvZ1JKd0R4ZnFjVEQ1Si94KzVIWmJBK0tOaDl1VzR5d0dNdWI5eEZvS056UVQvY3RnUmswTFBEL0lmNkZrcnFoVFV6ZUhqRkJYM2ZVS2NoaGRMQnF0Z1V2SUwxTWFYekp2TDh4bjAzSGd0OEdJZDFqTG5tQm82Y0VLKzlnekFwdmRYc0EyNDR1R2c0OFQzVGlSZjJ6ZlhoWDdyYWE0OTR1cXYxWEFZSUU0Wi9uU1JkSjJFWk5sbnBuREg0ejRjaTJMM0wxaEZ5SVFGRWI4S1FRdm0wbGVRSWtNZUtrekRpWXhyb0dpN2o4ODYvTHl5aGF1OXdtaHBiSHVjT041RGtmOGdHbU5Ga1VVWVVqamg5S2ZjUGozbkZBQTh6Y2E3V2N4bWdxQzBLdVBRQUZ5c0ZtWmxPOXBRckxVVVlmbkVPMGpnKzkzNURoRDl3RWVJQUsxdHZ5SmNrSDBKWlFFYzhoQUVLT3dCdEowL0F4OXlaTVpwU2VKYlJZT05XUGh0Y1ZwSXB6bGQ0Rm9uTHV3MXlaTmZQZDhJTjQ4ZnJnNXljcS9WY0JoampzaThZWUZHcGoyakp4Yk50MU53NDk4Tlp2T1NDbVJGQkJaRW0zMS8zakEwbWVSZXJVY0wvbUQzeWpBWVdkaTM1SE01U1VqRXNkNk55ejF3QWtRcTlleCtDRUJSU0Fib0cwRENqU3RBRHlzeGVQdWh5OG9NaEV0WkgxTHlkcmhzTThKaUxtNnlPanpYbFo0UXp4VWdlaGljQ1Mzdjk4VVZYZXlPcElnUEVOamppV2tRKzZZQmNzM2JRRFE4cG16UXloNWdzdDdsNFRDeThqamJScFFYNmUzVVlNb1RzMVVkTVFFb2x1QkEwaVN6T2ppc0JsTm9xWlQ1WkhQcDZqZ2JZYzhEakdhRHFZMVhQZHB3UnZlL3c3OEhOQWZJN0MySC82dTBiMWRNRnEwMmFoREljTmw4eFhTTmhlcGNnZFQzZ3Rodi92YnNZcHlzMEVLdDBGMUlwTkt1NkdJdFpURmNiYnpTbHBraGNXOEs2RnMrUkg4VkRwM240NVRtOUwzUWhsNlE4YXo3bU14bWdyTVB4bjJGdVlRYzAxM0NsclNsMmRGbE5QWEZsQ2V6T1FVK2VySlowQnZveUFvcUVnQXlnTVpUcDV1U09yeTNQcEEvYnhReDdNeUJCMEx0d3h1YTRMOE1vVktlTnlhMlJERW1RQU9ndjBzektESUJuTHg3MkloUzAyNEVQNXBQK2NKMHl3SU91M1FZaTRNNzlYM3Jnbm90OGd0dW92bWVSL3NLZEdMallEMFoxNWo0dHUzSjZXQ3RVRVQxSVRpYVpWYjhUSnhEWDNCM2d1ZzZnY3g5ZFRwbGJXZ2ZSK0lzOXVtMWZBU252NXEycXMvTmhSV0FKYmFXWHN2RWc4YmJOdVRXUTRBSHJlUXd3cHNQc2c1b2Qwa1hHZGhSMzRJOXREL3A1WDlWNmRScmtKZVQ3NngyQ2dDVTlrRE1waDhjRVMvb3AzdTE1UWhjb1R4V1JvamFaODE1YWFhR1dsSWRjNkkramovUHNUU25rNUJTU2h4WGg3LzVNS2dOa0lLbEx3bSt5WUNmNjduRTJ2N3VleUFEdTBxRHZiWUM4UFREbVpvQndJbXQyUjYrTFZiVzNDZmJ1SUVhc3lqd1JRWjFNamhnZzY1dnoyNzYyZWcvV3JoVXJXT3VZQnFFN3E2b2dNNEJKUmhocDU3aGthZDA5cGtzN0FZS21oN1VGa2dEZUtWZHN6M0E0c29LUzdUTHhUekhBZzY2TStybGwyUW4yYnVVSmxGTytFSDd6aStrTjJJNm9kbVlucXhhVkZ2eG5scWR1c1dtUEgvV1ErOStNZ0VBcVJrRnNlZHRyVlIwYTA1WnBzdXgwM1NxaVMrL21HNUxmcjR1eENzMFBObVRkVFNHVVA0YVNod3k0VVB4SEZmQXNKK0J0NDRDSE04QlFlUE41K0R1SVB2UklESm0vcnN0V0FUNGp4NXorMGllVTc3dE5iblVQSjhFSUJFNmJLdG1lQWZsOVo0MTZzQTJxSHJ6TVRjS3A1KyswTVhhcXJrRjZlUkExekZYZFp4SUVjdi9XWkRUM2x5dW4xNDNueVl3dFVaMHorV1lZL0tNTWtOUzZaNEJ1NHFwa1VPQS80bWg4blBYUkh3TGtaenhRZjZkSytsYzVXTG1pTkpLWHZDUzg1NXVpVWhvM2pML1pnRnVzRlh6Q2tNVThXZEhTd0JTZkVtc3o0dWZUQ2tJeC9aK1pZMU03SU1teVExUkRpTHN4S2xlc0x1c0VIdlZoNjNrTXNCNFpvRzlNODFHcS9xWlkyRC92YWpNMHFqcjBTZXlsWTk5azY0dEVtYVVaTjJZVVdyajFteHRsUW9tNXBIWnpUSitIalZuN1V6R3RJL0tXeW8wUmNQdjdPelRCMitSSmx5VHJqVjV5VzVkbHR5Vk0ydGd3RTNsVjUwR0JjWm5IemcwNXJDc0dlTlNGOHlFT3ZBeUhvS1ZOMzEvNnZTcVdtb2FSOU1GMmtPRWZndDZkSm9jK1hxQ3pmZ05KSlRSVWFlbjAxaXh5MHVkU0FQRUdidk1jdFNDcVZMY3V1d1RHZkZidG5MVnF0anFSWWVMZldpYVZvVkxiZTBYanVSVndiaFoxaFIrMWx3bVBiZzArcktjeGdGb3VSUnVMeGNFQUk2SXlOZ09EdVZBY2RFTHUzUmZka2x5emQ5ck9YMmx5QzF1ak4zOHBadDVIeEU0Z0J4NHNRdmRScmdWQldXV1l0OC9qVm5JNEFIc2U3aGR5VEhkZ2NDNVlqZVNnMnJYbGZjaHIyZWxBVExlWmpYUGRHRDZJdlNlNkFVOWpnTlJ6Z1FjR2dBNFk4MVQycmord25rTW8xK1MvM2x6UkpRNk4yTnQya1Z2SW1OSEwvWVV6dmprSlM4eTVkT2pwSTdjZVNjcmVHZlEyL2tIYUdXeVJKc3RtL3hIc0p4djVZMFlPNGthQUgwQnI0WWdZekpkaEszUkRrMU8yYXY3a2d1Ly9TUWFvZW5QcHg3T2dzU09sOGVQUjg3THdWSlRlU1B3UitYY3ZBR3pmNUM1U3lSRjRNZmErMmtuREE4UzZ0YTRFeXNuWGxqTGExTDBuUnN3WUw3SkhKYStPdzR3K3JxT05YY01lL1BDR0R3b3cxcXlEMTY0M3VnemgxOWxaeDVpVnR2YmtuZks2WDJTQWgxM1g1UEVzMjViQWFIZHBaOXZoUzZRRmZYTDcwMzl1RXE4N21idVcwSWRKOElGeGhid3NGOVU5WmRxTUppKzNSV1k2TFpJZFhLZkZIR1p0Smlid1FZd0J3K3hTeUZrRDFxTW5VMUVta0hQMDZVckZuYTd1OFdnQURpWVhUSFNYUmc3L0dqQjF5YzRIWFBkdHBCOE5NSDdBZWhJRE1IalhVUVBJa3lmWFczKzVZSEIxWlF4enZudmhvdEhrM2JjcjhBSXoralp2YjVXYzZOQTRkRXUrcDBzcHhUem1CTzBqMW91THJUU1NCL1NueE9SUzFGa1RsMmpyWXVveERETHA5SVdxdmpCWHhrT3J3ZWpGTSt4M1lOMHhKbVIydnhFUWN4b0RxUHJ6N04xbjlkUmt3UE1ZUUVDL0RnekFqK1hjVHNVaGR1UGp4dXFma0gzN2hveUFkVU1nWEJPbWVtajNpUWp3TlNKVzd3QXkzbm9KNHJxUFBtOGZwYVR5VjAxRnZpekRUaE9xcDNLQy9EdFphSGZYL2MxNGUwcWxsQkMzSk9uNE5EWVU2TzRicHdoM3crc0dBend4RXZRMEJuaTdna1BvQWJPOC9Velp5Z2hjZDlCLzdrZi9La1dHVCt2ZlpVeDI0dXZjcmd6RDhFZ2V4dGhTclRHT2VUUkxOOVozTnprc01jRjRWOUo4Tm5NV3ZaU0RPeGsrdmVYQldQTzlhd3RwRkV2T1YvQjNMaU1zTUlPa3k3eTE1UVNMNW9IcndBQVB2WEs4b0I2ZkxJSFQ1ZWRlTWNMVHRGTStPYWYvVHUyMm9uZHZVMG1wbURnN2V6SWZqS3crT25vb0l0QXVsUXI3LzZCakpiaWpMSzlJc2lGaldaTDVsaVF6NEVKUmNwS2Q5SHJMWFVoMTI0V3h0bHh3OFR6amNzb0JQNjF5eXljUHFHUnYxcmFmT1RvNC9sbEZ3WDA5alFGNDZOYzAyOFRrejJqbTZUOVVuQmZTVjV0eFJmWGo5N0taQ2YzYW13NG9XVnh6K29UalRSakdjOFZHRW0zSjc5ZmpUVHNyalBnaWx3b3NLR1BFL09ldmZBM29WQW9CcG1LVVNkUUw4NEJhcmxqMkl4NWVwZXpKQlcrOEwvRTY2aWRoN1VVN1RFV1pLbU1rbVpmbEgyV0F0eWFOSVRzVzBLVGtuQ0NDZ3dHa00rUnpPWHF5WXk2NC9mZG9EeWc4bVdCdkJuS1lUMGpjNFVlbjQ5Q0ZQNXFNQmRLWmtVaklKNmhrKzlHQ3VxN0hRajlUU1pDUTVUZ2dvSFF2WmIrd0JTOTEyUW9ZckV4cVo0d3d6OHN4U2pwZnQ4SU9yR2txcE0wU2JJOGx6SEU5andGTTNzZjc4SzhEdUVNVjNjQlkvRVZkYnRmWjNwenNMYmVVTHRPZHR0V3RLVEJzN3dCNENSeGtIemZBZGhZTUxSNWg2aURmWFNMaXcrVkRkWHJLUENDQUFRZUkvUFFiY3hFUjdEa2poQXdqaXBFZ3NsRVI4R0VZbno5WlI2TC9kcUd3NFI0Y1hzWi9LZUJmakY4T2NiYzhwVEZvckdjeEFBazdOenp1VHFlMXdUZUlsZXh3UHNWb3VqNVM5aXBEZEhWTStzOVVEZE1JZ1B3TWJkVkE5RkJTYitnUDJDS1lKd3cwRVpLeVpBVkVNc1hKdHk4bzUzRk9BSWxnSG1TUUhldkR4Mkt1OE9oZzV6QXkyaFQwMXV4enZicXJzVGROUE9KUVIrSlBoR3hGMnpPQ1JkTUQrVFVKOExpTGtzZGxTYnFtN2thSjFGMTFBQ3hBaGliRU0xb3Y0eVIyZnVIOGV0MXh6dG51OWlrKzg3Y3RSQlc0MU1BR1JtOGVkZGNjdDNQSVFSTHRVeVBTMDUrV0dleGZFVDlFVEFzTjRSdGd6SVpaSEoraWJpYjErZmFVaXhlbGdyNGRBbVR6Yi9ZWFN1bFI3blV5d2hQendXL0NBWTlrQUd3TXljaFlPMGJFTkpLVU0yaXZRZGJXTTNSU1FJZjMzdWZabjRrUG5XeUFOQjY4akdRYVJvNTRoMU0rdmJYSkE4cG15SHRTNzlhSzdCWUY4R1dVYVhQeGRZMmN6VjJWdmxYQkFzWnZsOWZ3OW5LRTNQUTlsMmppdEJMNllYaXFDbmd3QXhoTzZ1Z1c1RUgzQVR0TkRJQkNJVXpwNU42WTdIMDhaNENiYTc0bys3SzN2UkxaYUlWYy9KbHVXUWVpQURRQTJYUmVJai93Qm9nWC9HZXh0Uzh3QnVvSjdLMUg0QitkcEtsRDJ3ZkVOaDZBcVJMNm9MVk5oclV2a2VDcjY3RU1nQkRwekxCeE1mMjBrcUFDUUhnRzVtZmc5Y3JNZnBQWUgzR0NyV1gvKy9ybWVmYlRzbzZaWTFNRTZCd2pGNUN2VnJ0YnA1NU5QUElDVXFvdHlXcHRvSHgrdE1Ua0RPUnNubGF4Y2VYaWFjc0NHazJ1R0dZVjRaWlZiNlRyNHJOOWx4cDNyVE1HcVBROGw0cm4xcUU0U0VVVTdHS08reXl0cUhxUWcvNUVHSUVjMmVTK2V4S045WmdXT2U3R1IvNkE5VHlsYlh3YkJWNXlXcy9kaE9EWURrZnk3SnpmTkc2Vmt6NDFaYnhDcVQ0QjZNS2hSM1RJWVFIbHpaTWZienpjQXdBL1h1NkM4Y2s2MS8zZXpaYmxDSS9iN2FVZjlvYlBsd0dFcnZOVnEzd1pQWHByMVROekFUc0dtSTlDVmlvaTBHaVVORnVScEFlR2d5ZnJ1ZnJxQXp0UXZvZE1lR05RNG9nQU9hT2d6YVpaTTVwRThYYzBuQ0ZvMG5PSlBqa3pRN0pmWEdDQVpXT0FkZmlQTTM2aVZPYW9IempPSmRsMU91UHM3S2NvWHQ5SktkYU9LQWZXeE54Q1lteXlIcXpMSkZOaWE0bU14NzJ6U0N6Rm9IRHpYdVlWOTVVcXhUbnhDU0VOcjRaSjg3Y0tvS0lqMnFTdWNlbWZ3QUY3QnZBVENJMmVGR05aa0J1akRlTXl5R0dnOGlSc25MRHVERTltbFc2dm5kQ1RvUkZpMVZyR0FNRTRSa0dJMUF3VTl3M3lJeEFRMTB2cG9jWklCK1ZjS2dXdW9OYTVvZHdUM242TENBS2ZsS2xjOGNEc1NOZ2k5cnVBaHNUcHVQcGI0L3FJOFF3MklEc3pyMm9HbWtRVUhGR2xaL2xwVXRlNDRIZ3l3RkR6UVpGR3NrZWhYOXpKQU1hRVRCWXRDVE1TcXVRbVljZGNabllrVzhweWV4dkxPTFZ6MzlaWnBDOHQvSEV2czhRWEZFOFF5RWhTdHlGU0xyeWxLOUxlRnhyVUNKcTZMWkNzWnBzcGVmUkVrK1FReW1lTkhtUG1GczRMWVRzb2ZmalpPdTlnNkpMbGtDbWNyeGNtNEs4a2lGQkVHcENRU1cwL0dnU2ZjZGdQakNiZ09mYys2UU5meWNmd2JnTUtUNmJKY29qZ3R5U0FyNDBrVzJ5a0ZtUEt0RzNSMFgrWnZuRmtPbWVTL3VRejB5c3dMZEZsUzFMQmtZNGtvVWdlZjVKeVgyek1SWk5rM1EzRXM0V1JnNHJBcnNHOERmcXd2eCt1L2FzVVpybm1yYjJ1RDVGV2pnaUJ4SittTzJaVmRuM0loeno2ak5VRzhXZjQ2VXJrSE42dlNEZGdkbUdLdEUvWnJzTURYUy9LRkpELzdKTUFRNXhteStRemxBL0JZeEpWcEJ4aWpzKzFBU1lEU0tIVXVqZzc0cWM4SXJNL2lWb2xwOEtDVDhTK1lrMkFvcmNtOVpXY1Y0a1h2ZkxlYlZhUkRvWDlJZzhUYUVGeHBiZjNFZitLRnpwVlJEM2o0aFlUSllBMGhiTlB2SHVsWHcrMFcwNmwveVVISExsa1IvU3pON0xobGpQR0RPUmt0NWNwZTB6bkdqb3V2ZTR3U0ExOC96QjVTK2IyQTkxL2xqR3c2bmNrd01yMTZRellPQ1drZ2dlMWRwK0tCVjR2NTFsbjVHSTM1YzF4VVYzSzZjQUNKczdMOFREMHJnTUNPd1JsSyszNTRsbzMrWXpidG8wTlViVHRscEx0eGJ6S2pVUkhPbjU4ZlVoMlpJWmlqajN3ZTFCUVYvd2poY0RvWE43c1NQcVIrMENGMXo2QllxTS9tY3BhQWxuOGw0NzZhbTc5RXpnQUROQ3FvZE5Ed291T1QyWkxGem9BVGpUU0kxbjJndVMvNHk2S1Zrc0paQjdDWDQ1a1haRTJpRncrQ1FTOGZsMWZaUHo2VHVacVpMc1kwb21ueEsvNXJkNE1vZDBpKzBiS3NmRU9UVGhBRzhHMDNpU1lJOXUwK3E5Y25uczdFUVNBczdQZmQ1L3NrWE11MldoZFp2VFdzamVFMmlPUlV4L1Y5ZnU4VXpFU3hvaDZtcEY5MDU2c0Fqb0RrT0ZFdXJ6MzlNSGcxeUwzTWJTSnYxWXdxbEVnb1dGZndVdGtINmh4a1pYR2dDUnUyVklpOEpDSWwyWWRremVhcWNyUlgyZGtyRGdwQStOdVV1aVVkbXBYUVM5R0gybmVHbEpEYzVqYldrdU9hdjhEY2Q5TlI4dDVBUTMxZEU2dlBqMTRwem5XaTh1dTI5SU1pWjlrVE1ibDhPZDlLTW9JcHZvd1NjQ0JMYXRreDNmNDU1bFZ3YnlFQWNqSzUyTDVPYTVGN1U1UnI2TGU5bDB4OEMwSkRmSHNPTjZKUk9kNFdKYndQUXJlTnJOYVZRNEJxZHJyaGxYZ2lNQkdyNTN4UE83allvT0gweUZpWHBPTFQ1S0k5UWxBRzJhditlNmtydHNWVDlpQW4yckVMWEFnYnpXWklzcDFGU080NExQNUpVSU1PdUpBS1V5M08xNm90aTB5RkZDbU10MU9mQUVHU0RzUnNHZUE1eWdEWVlCY296cnNlcitEOFFPVVMrVlI1Q29GWG80MFJSTzBWbHRGbW5IMGlIR1FNQktRZXlySjdPM0lyd3NVSWdmQXNrY2tZRVZRYUdBS256SEErWUprc3V3amtkRmZJMzlKKzV5ejNkNTYwTldIZjlmdDk0Tlo3RVp6SDVVaVdYYTYwYWJwNFIwdW94N3BRZ1FjdVlHZUg1NnppeGZZQmI3dVVDU001K1RneHJFdHJwYWRDSzFQSk1CelFHUEJBQ2J4MW5MRkJCdjRramJqWUNxZ0VPaGhrblBrK3NGQXdGZjRVaVZFd2NrMHFOenFySnNmdDJoOGdsTlVTeDhMM04wZGdDV3NETEhabUFBQVVid1VwZWRFMzdHbGlqeHlrcGl2a0RKaUk5WHFiWWp6SlMzV0F3OEkrVjEwQS9USlNuZklURjhrYTIvTUlqZEZENUd5WHRZQkRlWWFIQ0xoYnh0TDF0YzJ3RVUrSW13K0EyMC9lV0dJVDVPSWRlcEVCWkQ4YUEvV0NkMEdLT1E2TnpMN3lOQWpSeVhoY0pQZkQ3ZWYvbXVBODBYcFRDcHcra2xkdG1USlJiQ01vRTFHWUs0MTU1Mjk2eHZhS2VnQWtHNW8wODdGdERBbkNzUHpVOXZBSnNLbnB0cU9SNERMd2VxbFpqNGo3TGxjdnY5YWtveTRMMkRkVXBVU1A3Qkd2dHBObjhpWU9EOXAxUzZNR1g2aW9MYmJIUGZLYmpQZDVlZE5xM1dmVDF4NU1BWkh6T1FUOWd5QWJ1S0hZd2N6QXlTQWJpazUvVEtNQjE4dk12MU1hS2Ywb2pPUkhrRnNSV2RRc2JqZ0tXK3cvTXloaWdwZzdqTC9UTmVxeDhOSlNmL0NhUURPQkpJT1NCZmtPMUhUKy8yV2NkcHBnQ3VzaC9kZHFwSWg2Zlh3QzFDZFFWNXE2eUJkK3JKV2c1ZUJZRGwzM3FyRFBQZnQwcFBjVytSdy9MS0xHL0txYm92dDhSdlR4NkxqMFpROVpLVjJYb0RwUGFtUEh5TUlIZ0N1VTYrUDZpQ3ZNUDZKeXRBQmRNU1RSZnJqalhHZFd6QWMxTFdKZkc0TDdQZnJsbG9sOVhJWThSRTJCaUNLbzZKYjBja1hJNEFUK3g4endJN0trdTBscVIxSEc4MWxWZUdCWjdybFNUdkdab0p6aVU5MmlGMUNYeHowallFOUNjQXpJV0NBVUoxbEFNZ0ppKzV1ZEpqMnk2VUp5SFhxOVVvb2lIYnBuTTVlQkI4NXFhU1NsNFRlemJDZXMrMFBGaGpBbXhJYldpWktxQ1RpcTI4cFZFL3VjS2xFOGhKVHk4MDFtUGQwVy9ROWprL0NYQzF1ZTdyZUtiSVl4cENZdGFSbEdJRXI0M3NzR0lJaXlsL1h0Rjd0NXBWdDNjV0hUSWR3ems2VCtSYm43RWhodWV4SVdUY0NjbUx0ZE1DKzNmS0hBRmE2eEh4REZnZEZvYVI4aWo2SW0zTUdYTWZmVjVHOFVOWjhsVStlNHdQVWxySml4aDBNUU1LSFBYSXl4dzdLOWdFTERBQ2JEb1lkbVhnV1RqRndEalNEOWF3OXdvVmpDOUdPZThEQlRoSWZXMk81dWhzREthcm4vbWlaRGoxTUdrNEFrUTVncWJkR0FYdzUyY1ArMXpvQ3lhdWMvbXd2elB4TGJ0bitIZDYxVGhQTTFSaVpWYWx5TzlBQXlkd0xnaGNPYWFKZXZMelJRVWpkZDZ0T0M5YnJ1ci9QOWVUamhVbnNaVUdIOFVUdWRsV1lZbnlvUEtSSTkwNGl0c2VYUGpTUWJxTUUvTyt4R01yd2NWSUFETER4N1Y2T0lTeTFEdnRKMHRxTmd4eUpiRUpKNVdwOVZqdEMyK3hTYmprak5paUJqVUdOVWlRdFlHU1NZS3o1NU1nZjJXRG85eFd3YkhyZC9lSVdENnljckdZcW9SWmtkMnVlajVyZXgrY05Wd3BjMitxMDRRaHpLcHVNNXpJUVdjVzZwTGZ4dGxlM3ZQc0ZtMUlYZzBYSU1vN3h4SkJIZ2hDSEFWT1FkRWZKNCtlQUU0bEtBNHpWaFV2bW1rZnc5ZHA2L2ZZU0JoZ3gvL2xBbG9tM2pGdnBZL0l3dTVYOVdwTjdWanhlTUhORk9wNEVoVVhKTGRkbkE4Qmw3bEVNekZURlZEN0tQRURtbW9LSDd6dmVDSDJ3UFEzeTd6ZCtua1VVYW9KMTFURVh3N1dFZzJlSHk5b3VGRDdqUWhSTXN5RHBNWDgzL3EyZ3crRStiOTJVM1BXRmhJUThWQWlZWDdLY2w1N2pNWjFVNGcyaVFkS2VNaXB6Z3UxUWFmU2pCUWFJR2Uwd2tWeDhhQUZ5L0FwNTJRMHVmODRSdWVIV1dDZjYxbHRtMEhJWFc0NVhSWFpJOUtXSkQ4QTNyc3F1OE1OSzUzQWVjNE5idXJsOTQvOUZ0S0tOOXlRT2VOL2dySkdVUjF2WWNtQlEyREFxN1kxVzArTGgrSTlPY2dlSEVRMjlyRGRROHRRS1BPSktVZ0ZEQ3ZaMFA3dXQ0UitvSzMxZmNMSk9LZ1VOb09TQVI3OU9NMkJWbkVyZ2N1cVpPSlNVM1NLZzY0OVlZQUJ5L3ZrVzZDSFQwSmhFN0FKWjMyS3pWc2lmWGE5eXgrZ0xaT0d1N1ZHZjZmQmZqSUNJYWZQbEdEbDFSV2RRWmZHU2Uzdkk1UEZ0QnpFZFJxWk1jT2o1ZHRwZzk1Wis2bFkyRmprNnBIZmt4WmlxbzhTaUgxelNBaFgvQ01TaHRQMk45QUFTWW1vMGdqa2t4NndHcU1mdGtvSzlYN2p5Uk5MREo4S09PcFhnWklDVGtiUHU3WW9WT3h6VnRJVEZLQnBta0VzM0loWmZXc1FBSzQ5enhHUWN0Z0lpbXhpR3RsODVIc3hFYmdHWklZelNtd3M2YnpodDRNNDRzT2kxVytoYkU2NU42MlNBUlFaSHI4bFg1bkpYVGdtTGlreWxwcjFQZHR5VjgzVzlabFhZT2pNWnl3RktuaFJ3MnFkN1BPbXFkQ1NGTDVuUFBsQkJHcU1CNzB5OENVK201aERienhoZ1VSZHVRSVZGZEN0SkhBU0FjRE9MK00xYkVmbjBmZkFYdnpTR0I1aUQ3MnlmeDlDNituRWk1Y255TFo0ZEZIVFBGWVFLWE94Uk5PUmg1TUdPT29EVFFFNG1QWS90V1BVK202b3JqK0hJd0UvR3g2YXpqdWxsRkVaenA0ZEtaWXppUHZNWGpzcDRlZ0NkRXN0V1ZBZjY3ODNuWU5jTE5IWnNBVmw5OVB5K01xUVZJby96YzlTazdiSkxUSjR6d0x5SjlUSVVXSk9EUjMyNkpDdzhLcGxvQ3dCVmoyTGFIYlpNRHpOQlc2RE0wYVlUQy9hTDY1MHZPeUF4d0tCa3BaQlRZam5YTGlFYm9oVGIveExmY2VrOGIrckpjTGJJMGRTa2VCNm9SSmRTbWdwOVhWRVVRRTVtTmVKTnhXRUY3Z2dwMFBxcktMd1ZhZDV0Vno5aWdPMUhlOWZDRHAwZkR1VjV5TzRjVHlMRE4xZzRpQ0dOM3JPUnFOc0lBTzNMN3NWdG9OZWQrM0tHOG5XN0pjblVQa1dEUHhiN0I4aXFsbTFHelJrWjFha0J6d293Tm8wY2NJUnY2QmZwcHg3QisrN081NzhpaDFUcFNXdWNRc1pXV0c0TVI4RHlLTGttM1dscVFSRWgyVTJCdkVHN3hsM2hoMHFWS3c0aVQ1Z25IWGxvOWI1RWljWUxhcndSOEpzTWNQbmJDOGN5aVc5NnNkY1JvSi83bjZEQkdHRXRJMmVmMlc5VmJsKzIxdFV2WkpjK1JUYzYzZ2xlZG1Xcm14UTVER0RPb1Q5Q1h1eUVvdUR4R2dDWEl2L1BjdnNDMlE5U2djRXRidlVOUEt2MHg2T0w1aWZmK3NVN3cyRllkck9kdGVTK2srRlBmaWV4WE1QcEtUbG5ZcmZhRW5uM0FmSXgxUE9PU2htMEI0ZDI2UjJZSE5Ba2hkblBFVzJKTFZ3M2Eyc2ZIOTk3ck5XbXQ4Y0p4djhrVHF5NjNOZ1RIdmpvKzR2MnZFNEdkVXkwVmJMOE1wMnBPZ3BjOGVuWkhyb0hSbFFFLzJyM0NieUY4TU4xU1Jld016QThpRXlwTXhhZzgrYm0wRDB4QXZZZFZPeFlqQ21HQ0dnQStBemhjVDZVWDlNRjg5WHZMRklLeVc4MEFuQUZHTG1ERlNNUkV0d0RIemxHU0gvbENtTVFIZmI1TkNBdEVjM3FoOFhXSmFHS08yZ01CZWhzNkFXaUFkZTl5VUJkN2ZJK0VNR2NoQ0hUNFNZZzB3M3FYLzlvdlpxN2c0VFFzZy9Ua3puSXdyKzZzMnI5ZWRrdEZZaXd4RWUzdFVtOFMvbHM0UDRJQUxrN1MreUYzQlBCSW9MYnlKMXZLNU1ac1RKc0lRc1lOTVZ5Y010OG1RVUdBd2hqeVZ4YzF4TFFjc2oveTZ2d2x0TzlpVUdoZE1hVGJuY3gzbEFDeUJLcEtpbmdaWWhNQm5RZGhNSGtlSzZ2Y3NFemFodFpsNzJNZWs4L0ViV0pSKzUrYXY1ZjdmNU9iK01yZFZYa1lkQXUydWEzTUV6cHFOWTRwcDN4RmZwaDMzMzZmQXBJckhNRzJKa0wvRlQ2a2lSSWlQWlFaRzFuMnhoR2pUM2Z5RWlvNzVmTmNGREVHQThvc3VjZWRmUzlma2JxVU1vRkpySXgvdTI5SjB2NStMckFQVThDc2lDa0dLVy9ES3diZEk2ckJzVFg5ZVVOVUQ4ZzNzcXcyRmxvZ2lkbVRkMnlSQStiVUsyTmdZU0E3TlNPSWI3K091VnFtSkxqUEdOd2t3T1dJOWRjeDEyOGQzYVdndEM1ejhHSHJKZkJwRGVramxMVG1EM3ZCNzIrZzRzYU04TkZIVE0zY1VxeHBLZnN4QUhwSE5FTDh4RGlwQk9hWUtxUVlaQ1JvdVRYd1JiNExFQ016bE1GWU82ZVRBaUkxV3F5QVJncE9aQUtpTUE0SjJXUXg1T3VmVEtEYkkwbUY0azdoVndrWFJGVE9YNGd6aEFIdWsyVEJqcjZRNjhqcDdCc0FUK3lpNlc1dStPdUd5TzRLWHZMRDBzbnlPV0pMdndsT1hENTBoTWthVzlIRU1WbnNxS01uM25KZzdOOTVEc1ZPMkdWMDI2WDg3bkZBT3RKZDdmNURJZGtZS3gxNFpNTVpMeU5qdlk4b2g0YlpiQ0JNMVhjckduZVpPNDIyd1h1TXF4OVhGSzR5NElwUnk2RHhSdTdDdUFEUVllWEJMSld1MGZvM296cXNmOEdFN0dTc2U4UzBmaUFzMDljRlJsK0p4VDBYNUxWUVA5clBpa3U5VU9GeXZrV1pDeTNSNjNJbXVyQm10cWlSK0RDTDVQK2pBSGdVVjJaTEhYb1g1TDdHT05rWmNmWE1mYmo5RlBYSWtFWk1oZTFtK2l1SDhrbXRROERpSll1T20vdHM2ZDA4b254aDRRQ1JKZG1HVkNXODJHYTYzWldWdm5rdDdnWWZFMmNYN0dKSFlYTDNwd2RlWHdjeDBsNmZucTBwcnVCam0rSGxUVkxmZkk3VVBoSHJrR09sczR5aXU0amVYZndBaExiaEVyQ3BmdGQ1WHR1dlE1d0l3WDU4ak9TcDVFVDVnMXVqUFkxWjhmSzY1WFkyYTR5aU5pV2VEM1o1VkZMY21JRlhuMS9QVldxcDRKQ2hrVW02UXBoZ0ExZjVKcWVxUWdYdHpjNmthY2ZmZkc1Si9pbHBuNHVBOExBTzBBdE5VZk5oVDIzQzZPQzNTQkJISkM2QndTT0oxTVdnUXg5YWxrZ3hnbGtlaWNEN3hpN3BpTHlvVWdDT05oMW9HV0ZZQ0F2d0RadUI2RkZlZ2FUK1hUM3p4SEZURFZKbU01ZUJqUUYrSStyUElUVDFMREhBT2phTDZFd1ZVa2lYclhzVkh6L3ltSmY2Um5ZK2IvVTVVZjZydk9tcnZ6QVBRbjQyMXVqSlpzRllqRmp6KzZjci9sdWJ1OVlPYm5JMzhja2Q5d3dEMzRhQkIreHdEY3hmcndiOGFEVnZlMWc4YWFEUEcwTGxMRFpVU05pQXFLdVNuUENhL2ZJUVVTWFRwelpBcUxHckpCQWZVSEw2T2dpV1pJVlhVdjNWc0M1ay9zZHdkaXUzblo1TFZZTHQ1VGs0dEJJRCtoRHJpM2g1NGhsaElQcE5VM1E5MWZHUTduWU1KeEFWOUJXTWJUUDRSVTNELzJlOU9zV09WM2xtcGN4MzdGNWdTdC9Hcm1BOXBxVEVCUVdGczNBQmNORHU4cTJQMW9iRW9MaUgxS2ZiLzZiUTAxTmNRUG16cHEzbVNQdVQ3UHNSZ3FqbEdVclYwQ1BGQ2x4MUR1WjZrTkxxZmphZlNsSHhxZEhHZCtsOTFtY2hTNG42ODllZU1GU0Q5VHJFNkJnY09rQzNVQ2E0YXJnbVVSU1NuQWdvMWgvQ1lCc3JYQnlXS2RoNlFNc2hEMmJsY0dqOSs3ZndvbEVSY3lZWnZEdldLWXdhZm9SQTh5RW1Sd1l4Z2U4TVZLbWNBNU13R2VYSzJaRDVnRGF5aW84RkE2OE01ekRnaGRNSnU0Mk9PcncrYnViWFU4bkd0NmVVYlYvVWVtZG1zUUF4bzVHaEZFckxGbG1PcjEwNStuRXdFSDVQbVE5dkRLb0U1THhMZlNDR0hYSkFGbExvYWxIb1RlMGhJN2NDNWdhUWtFcDFkSlFJVjZJdDFybHlsQkFuWnh3TmhldTVRNS9zdWlPdXlKQ05OcGRjS1N5NGIvei9ibzB4K0FFM0Y0YVpTZzlMVEMyOUdLWGJ6RENMSy9zTUF0eUM2ZVVDR2pYZFMzTktvd2pBN3hoWXVTQ3poZHZPSTF0V2MxeWZxbkdLLzk4endEakJ5ZU01NU9ONGZPWWpSRXB1SElEMWNBdzV4OW8xR3JTa2ExV1o4Wmx1VTR1K2toMlFaRytIVVNRZS9pZXc1QlhXZHdhZWdWQUpiRkdsbjFFU1VnRUZFcGtqQnlZZTVvanhmM0dUeXZTVE9XcEI3UTUxWXFuUERHZE9iT1JkeWMzbW5wTXBZaG00MW9Yak5XY0pvKzJ1enlBNkFNTTJkQ3JHTWs3UFhXZ1AzS0hYTDQ3YTQ1UEcrMU40WG9nMzRhZGVXQUFOc0JOUUlnd3RCallXU0haUldKUXhIb3I2dXpqajl5QW91a1REcmlybHFQSHloZnBxbDQ0TlFuWHYwQ040d3FlR3pmaXVldkhSeFJneVJyVHpma1ZaQWFpV3VhS0pXdm5ScStFeDNZaWRPNDZINGdQUlZmbENEV1hXd1ZHMUZjanJpSkUyYkkrYW5HWXZuamNPTVJXd2VoRS96aVFoUmFiWjJodTBwRjhObnJGbWNqZUZvYUFtYmZZclU2NXhISnRCWkRxYkNUTDhvR1B0bXNpWmVucEtMVkV6aHp3TFpGOVFkVjBrd2ZPbjVxQTJJUHJkT0IxWnVwOG1XTEZnSzZGb3k1SUJHSUZVeTA1WlBmd2tOblBRUTJBU1VRUTZmS09wZ3BKMmZZZzlEclNEUk5mZTcwcW5ibFlqZWsvck5FMjBCQTVnOFhnQS91NVB4WCs1akg4UjU2TVlyVXJwVUlRZWFNTWFESUEyczhOZjlaeW9YNDNSY0c1YTdhUjAvRThYKytZNGZyYXNwdEJkV0FBU3g5bWtMVmVNVk11UkdJV0QwVENuZ3d0N280c2xUNnhBdTlQNFBOMEpQSWpHTmFLYzJzckIwalZSV0hyUjR0a0hPcUl5Y2l2Wkx3aE1ITVRjeUEweEY0UTZiZDdjNXQ1NG5PdDFhU3hzR2NKUENieW9LOHNrWUtSTXBzdGRBWmp5aDhyZ1lpL0FQWGFjTHFaaktCL3V3U1FFQmZYY0pOV2MwY1ZNc1g0d29GNjNLdmRuV3o2eFhtcmZoa085c0VKRUd0TGUzWVJVd1ZRbkR4K2FLYUh3VTEyQjg2NVdtSThueVI4aUJwMytnWU1wOXZJV2JFelFFVzNZN1ZMbnpLUjNLUDNSQmVOZ3kzSmZENDNad1BXRE9mRE5VUXdGMFE0NlZ1V3pRRGExbWVmRnpvNFV2ZFBUTzc0MnlSMFpNeTY3bzRnU21wUnBGRzdrdWlhQmgwQ3lOdW1qZkh5cGtORUkyM0dUZ0hlaU8ycGlxNE1tRTlkNXFqNGdxWk1VNDlIOUJScmdZZWJUT3gzZmxrR1dnQTJBNzFyWlB3aHFvM1MwVUNuMzVOdUdWWGQ0YXdxYlBPZmRVSHArK21IM3VVR3ZIRnY5WXFnQTlBMzFtN2RLZ0RlM3RrZjZLTmFFVmhSRnVCZlk1eWpPaGNlaGszR1ZmVXFXY1lHSkZNd0lYMzArZTFXMTBuUU85Y1lJRTROMUdiWkVCSGFqTnNPVlRIaTZ2eGNFUjVFa3lic2ZuNzBZY3dhMU1OT2R5VmlxTDcvNDRRdnFuZ3ZiQWdqTUlhM25UZkpsemlKQlNBcXJRYjBnZHlucFZPVE5PZGNJbGtranR3cExvVTFtcnNTZHppUjZXUncxQ1pETk95SDlVeFUxM0p2RFE5UVY3Z29KRXNNMzRuWXUzTk1xZ0hPVzZyWkZmUitkcGQ3VmJkYXl6dzl0VTFwNWd0Rmh0eXBhVEFya09WNHY3VjJHVkZBWGxsdDlOUXBTS2lEbGZZSytpTnZrbnJkSmJwQUQzQVBkRWdQdHE3bk9xUE9RUElDSkJabHdPdlM4NXB2d2U0WjRHekVlRy9PUnVWWjd1WHJFRld3dFdzbzdBV1I3WVh4SVZ5Ymx3OEFzdW1DNXNjSFZnRTZYSjJjMXZwNTNuYTd3YndpN0k4b3ZtVnN2QlVOZG5lODBkVElWYVBtTFRPODN5ZzEvV2dVcFQvaUtIK2x1QUIrWjI2Ym5WQmNyMTVIakJYSTdNMXplSk0zaHhzck9yWXEzMU16YmVYbzJwVEYydXFoMlprSFZCN2RIQ2hIS3BqZlMxYUErSUp5Z2kwWDBZc0VrY3NBaU9KQW5aTndZQWVwZ1V3eWdsdTRja0Nxa05Ibk9ORStqVitjcDJNd29aNE5qT2h5RGRZN1BURXAwcC9BUEptUU5Fc0FTODUrbTk3WWZSUkJObzUwdDJrSkJZVVZPUjJYZW9mSDQ5YzJndDJ3a0VSa0dkR2pXb0VlSnI5cGxwdk5odjIyam9wTGk3cXY1bjJjSWR3cC96djlXSkFhWUJtNmprbTV6TEJZVCtCcFRCYnZFK3Y2ZFZ3eGg4Szk5ZHI2OGFpMmN5cTYyWUd6Z25OYXRJckwvNTF5VGRLa0xFN1N4WnZQenY1Z0FDU2dNTkR5c2ovNC9pMTlrMFliZ0NyQmxHYlQzSjRXa2wwK0ZkcmRXcXFzdW56TjlLVnZQYmlUSDlKTWNPdCszL2p6OGtuSENMK2ltc3BsM25IdmJaSlJRdlludlNOM2ViN3JLK2ttUXFUSFFmM0QwU25jRkVyZmNXUklwbVhCQksrN29RVDQ2VlhJTExCdjNZZEdoNTZCU2FoL2RjN1dHaExEWE12ZHg4c2dXdGl5bm1jTXNCU0V0SDdZeFJkYUhGeG51SER2RHZ1eGNGY21vMVNTWWl0c1JrVFpTWTZ1UFVrR3lQTDVBNFJqQk43VjFnM1M1WDJyR3ZiL0xQNmJDRHl5bVloajVnMTNYbmhId3piaktXUTc0d3MrZDlQRFhHYlpVbzhEN0s3RU1lWUZNNkNkaE1xR0JxS2pRbm82bFV6UFVtb2ZKNVl2QzB2TXhtMVRXeDBZQUdiaVR3RTlmSXE3SS9zQjZVeVBUNWcwUmc1d2libXFKYWZlRmQwVlhMdDlrWit2QkxWNSt4TWloeHJMSGp6T2hRd0puMGIycTl1Rmd4MHdWMVB2c3VGRUhYU3ZHWFNZdTFsN0p0eE5QcGVYQVp5REpVYmpTYmMyejV3eUUrZnRpcFFseHBKNjZFQjN1eG5jaHU2akhFbVFkcHBzZi96NzN3bnk1NmVESDBuejNJVVdhZ0oyRVhDUFNtcjZ5WitESENCRmhMZlhrVlJabDZ1RzdvY3R3MU8yYjZSZTVSVlpIRkZBNWtwRjBwcDVQcmZaOVlmb3JVWmtGZk8rMzdsU05wVTZJaHhBbnQyWEc4UFN6V3pWYlF6QVJjZDc0clNQSDBDUUd3ZDBWSEN1aG5uOHFycE1LSm0wazFUejlpZEgwT0ZMRDhCN3I1ZmRaYmRlaCtFVXBveTZkUXVGajJKSCtXM1pCZm1mT29XbURoS2RyZzRMZ01KeDNaSlVsUlJFWE52V2lyTlA4VXd6QWYwSzZJV1J5MkF1bFJLQTRwMjlBTjRKWEVVL3d2L2RuTnlpbWpjTFEvb3FBaDgwZGp6NHpROG04K1ZLblplclVPQ1JHekpKNHg5RGZUYjF3WW5hcmFwdDhDWXdoS0xTQUhDdEcrNUp5SE5MMU4xUjVPK3NUMktjWUFCRnhqZ2F6aFJEamNSSVpySkphc1poam52SlJMYWtrT3ZPZml0Mnl3NnR1OWVqRFZGQ08vMnRhbUFMek5kK3B2OGtHbmEyUlQ1ZW0zTmh3RHBmMVNUSkIwTCtuS1dodjdJQU1INmYwRVlFQjZNUXlmc3FHSUo1R0ZjSFU3ZVU3QUFBOTBUMDJSQS91VlgyOUtHcUJTeDljVW1UOHpaQWFyZnM4YUE5NW51R2NJbmZ3aE5LZU1Edk9remJvZk9MOE5oR2hFTXU4Y1FNUEs0KzVFUmV0WDhwOHNiWGozdFpHbjVoREt4WlhUV2xmSG1oWU90enU5MTRVOUhkQlVBSHJaM0xSMEpVWkJNVG1ndnJNK2ZRR2ZlSml5R2hXc0NtQk9raXN0YVpqaFUzL3d3bVdCMUEveHRmK1BUVGVCTG5kdnlZZFBFNHEycXkwdmpKSldMSDFVVVpxR05KbDU5NWVnZmVUbFBsa2dGRTJ1YnpvVkZmV3Y0ZVFDQ1RFV0pmY2tJNlZYY0k3ZDJ2NCtZWXRaL2UwTzNsU2RCOGZKc3lJcDFEY3FaeFBFY1hMckpaMVdnSW4wSWJpY1YyWGI5MHZHRFJoLzFuOUJtOWpZM2JHam1XNFJ4K1pnRVppV3FYQzlmcmZON1lnRUZkRHd3d0E5aUFjN2tyYi8vUityU0VtRi9FanBKazQ2dVZxU1M3SldDTnZBWFBSSisrMVRXOGUwV1A5Y0l5Q2xheVFqd2thZmhweTl4UlRpeFhLMjEwTnk4NElIeTNZK2RxN3ZYdWJ0UWtEQWJnN3o0L2trbHpFZFh1ZGNBTE9CMy81bzVDZjdzTk1XYVZ5ejlrQUJQb1ZOMlJrQ0dIeFMxRDdBY082ZTgrdDlydGdEdzNDdkRKR2hNL01VbVlYYTQxdmNWMTNlL2kxTmVTVm15ZjFhRkk1R2QvQUhYcEhaN2tCeS9ESE53Y2k3T2M0TVh5V2VYc2R2dE9iSFp1Ty9UcS9iTmdJUDlDMjg5VXppY3JPQnZ2MFNMTjVtdkF0cjVNMGp2SEtuOTVZdW9EbCsvajhEQkRyREQ5TzFyWWNlUFc3YUJXZGRWOWNMbmFybzJOeVoxNjM0THpaWGI3N1pqa2p0aThqenhyYnNnZWtpazNRRjFpeDFVOVkrR0Z4eXg4VHdEc3FyenpwNk1qTVJjTlNaWWIzcDA1QUxHZDljcC85K2FPcTM2dUFCQ21HMVFDd2pkbVNXZE92b2ttNzNFMVZ0WjUzTDIrUjJudjkzMXhIZUZCSmM5bEt1TzZYYis0dTU3U0QxaC9VeXlQQlR0OVZab2pjeTdPZisvV0EzakRYUi8zd1gxOERnQWlPWWtiU1FlRWhpeVAvMERlUzZzZjQ0bmNXRVNwejY4YzlNNHZYeGRZZVRBQWRJL2ZEd2JBVjhOOXJwOVB6VG5hQVJEeVBVSm5BeHVKUjNUQjliNUJiQkxRQ0kyOGFneVF1U0UzeTdHUGVINDU4SzJXTTR5UXoxZWQwRS9rbG42bUFkQWRpcHJSRzdNdURIb3owS0tCc1prZUFLZy9VUUdDbVhkZVczY0xNMkMzZko3Ri92UVBhZm1pT3h6NWpBQ0tBYmhGWGIwOVJjY0drR2VsSndyY3piNURITWJiY3hPbEIzVmYraER6WFRUZzFsU1EvZVhuODc1OWFJTlZmZmprcVdxVm0zTG5PMGFYbVdFdmhMVSsyMWlmNE9EZkVwUW13WjRwR1ArcHVIUHJScXIyODVzQ2ZJclRxejI5SDNOZnBXdVZYaUF1Y1NUbHZsWFZkWGU2aDRQUVh6S09RTHVVTE1TQ2dIZm9BRFQwSjhlV04xTWZmMW9Ib0kxdlpnNHhGMVhOYmZSZkVJS2ZsTU5KUmNBdTBqZ2t3S2lRV3orM1ljNHZMTFU1cUhCWlB6RmJBNHFuMXB2QndvcUpIMFhhY1hrVHZzVUFKclFJNUVVRlpDVnpBa2JTN2tRdUxUSXBndUhtUSs4QTJjVlBPdm1YZFN1bkQ4Y2JKb2FRS1RHT21MNFV6SURHS09pOGJsbkVoYkZLaGNlTUdNRUQyWUZiWXg4NGpaVW5INjVYRExDcTNqdXVsdSs2Z1g2WWRHaE11UG1xVUkwSTBkdUtCaUJDMFl4eDYraTgrNDRBNENRSmw1V1JGNEhTREhkaGN0WjdiUXVHeHVmeGxLcVUzcFEvNWxNTytqT013YVJTbWhsWjBtRGNyZ3dRQWs0SWMrbVJzR05jcHdnQlBESGJoVXB6UU0vSERsZlh0ZklEUFdGdko5UHRreGxTRGlzUzROc2Yxc3NQeVU2K3diQUFCMEYxMWFLdXdBZ1BMMHRreEc2UndOTnV4YzhXb0RvVTUzRzlOdzMwT1ZnbTEyanJIOXhPN0ZCTGF3a2J5czY2WndDTFNNd21wOHM0c1JqTGFYTUVNaUlkZk13NHJGeXRYZUN5RFczQ0pzU1NKZVRjYzdFWTFLdEhUWUg2TkIvd2hlV3RPbVdBd1lucmFXdll2UmZIWDlXNVN4U0d1VWloT3NiYi9NVFFwTzJTR1pYQ2t2V3lxT2o5L0czYmpXRC91THNYZlhrSm5RWUhoRDBUMVoxMXlsZzlNWjBMR20yM2VvN3UvNk8wdUFCUmZGTjhKdk01TmxubGdpWjJnSGh5UE1GbXgwWUF1bzl5Y3JzTUlTT3VjbkZYMzMzbTRLV0hHTmJIemVQMWRtY0Q5cXQzaGhoL2ZUUTc5TllhMHA5alVqZHRWbXhUQnI3VnlXU3F3N1ZNU3dObUg4T2UyNlc5K0FrRFFMcnEwdE00NkVRbHQyTFFHNWlCM3JmNGhUckR3Q1hxbWdkSDdTSW9YUUlnanVQUk9MaHoxbUtFM1djeHhnVzl2R3BZaWx2VWtPWDlPamVkeDYxSTJHc0VKMGhndUlHNWZBWGgvdjNGRERCQ0c0TUJSbW16TU1BM2pVRHB6UUNTMkFmblh4d21kWXdBYkI2TWtReEdsN1JpQmFKSSt6SVU5akVEY0c5eVl5UW5JRXhkbXVSUjJYdjdYTWFObzE4bGM4L3p1c041NlFJVWZaZ2VqN1k5ZHdCa0pmclN5UWF3NjQ1ZnBzbkZxaTNsTG5aN0hKNGpBVE02RllEeE1NUk0rOHI5ZnJRWXlHTzZmNXV2S1o0TWYvbXRkS0RadkhvVHppTnNaQnc2QjlCeWZlcVcrV1JUYUM1Vi85WXdad0xEVWVrTkxwVnlsZGI0bUFGS0h3dEdxbDlkbW40aDRzSmYxYWdvQjBxMTJuRmN0d0FnU2poU1NSaWh2UXVBK2d3QUN3RDVqRU8yUC9sRC90b1lSMmFRRlFsZlh2WEpVSWF0NFhsU2YxcWtNWmZaalVMWUtoTTYxTFZ3NC9lR2ZKV0p2K0hqRFNYZ2dlbEIwdmRDL25kekxNQkR3dHdIZzFtbFJQWlNHL2xOSkN4cXVYUnRQMklBRkJtUUc4S1NKRnh5RHM5ZitJTDY3d3ZoTTUxZGwwbkQ5Ty83cGJLMkZZMm1PMHV0OEE3a1BvbnNLdkFtMjY0d09ieXJGTFNHV1NreTJNU2o0VG4zcTRRSXYzclBOOVlvSWh6TzRHYUdESTVZdnVsMHpzaDZkZllURmI5YlJQTU0zTmVjeVZqRzNFWVhBNmpFMER2TStwaUNkSG1OV3d3QVJvbDBWa1AxbHg4a2k0RlZ2cHhmOW5JMmQ2ZDRLSFdPM1pCNENJQkczRFZ4K0FUUUlEMnp1K3NNdThsNUY2TEhEcW5ZZjl3NWFwOFpENkZKbCswOXdjQzdsdGtpVVBQNDcwd2Fsa3pmWkxaNWg3YzhyTE9mMXF3V204WXdpM1VsbDhuNzNhYTRNNHovV3d4Z3lPQXZWa1V5LzI2RXo3bjU5TXVqVEF2ZjJwaVRkdUFBMU9OcWhQQXhPR1VQY21VWi8yelUreDZNaG43ZUdGdksxMDZRVFN6cll4NEhZMitYOHdicDd5d0JsemhJb3QwWExOMit6bXY3TUJ2YjhQZkxFUExIVzkwSXJweEMvNFRjRlRrQWx4WmNYemNZQUZDK09XV1NJZW1XNDB3R3lxMDgyYzFsVXArOE1JSS9RMTZ5VFl1OFRtTG9vNTF2YTRyV2g4SHcwK3FTTGhLOE5mdldIT0JGeEpMWWlzTGE0UTU5OVNGR2U0MGUvTDNGREhCSjkya1dDQU44eHdqY0YzTzRMOFF0RExkbGoxdUIzKzQyd3pUZnFpMjd4UURKWVZxWnN2RWNoWmlVQ1hBenZocFpSTHNlUzIwMXJlZE5hS3JHbzBqaC9tNnhaVi9qblAxN05BR0dxQmROaE55UVlSREtyVVlFYnRoUjRDRm9sUjQxZ05lNHVkZmJRK3dYd2hYZkNyMXZ0SEwzUWMweGRJYXBiaDNGRVF5UnBVTWRiZGEzYitRR0F6VEhneVBKOUpLQjJwdFNNc0VMN3F4eTk0MHEySzh3QjRuczNLYXhYWllISkJITjBoYmRSSGZydHNVN09TQWkzdVhvT01ROTdxNnB3UURDWHBmYlowaFQ2QWZwQURONjA5WmxtYTJMaHllNmdVdnh5YXE3cVRLbW5xc0Fmd2pHOGVsbmoxOFVZb2RvSXgra2RuRjd1N3J5bkFGWWx0Q0ZYTVF3QXRQN2NXcHBDVE96QXMvLzB6ZVV5a2NycVExM2Y3bGdBQldsYjlqV3FyWkd6RHhHT0F4OUsrOUNnUU9iKzc2eXVoc2tSYWY2VHF2QWdMbWtOcjNrRk83OHk4dmtTWE9WOUFXUGRnMTNYLzNCeFhVbkJwUnBaTmVmeWU1Z3hUc1kzbUt4cVFxNHRneUFSdGFMZXk0eGh3WUpsTnU2NkFZREJES2FJK1pHa1doTm1Cem5reDI0ZTBzdVVhbmJVY29QSHMxeHQ5OHVCcmdKUzhESXJNd2VBQ1hQUFNIcSs1Uys2V1ozaVFad1hMY0N3cytnNDNCNkl6eTN2ak1XcTVyck1LV3A5elJaMzdGOHh4akcvd2ZNK3hHcFhML0hBSnZsaDNONEZybXNHZG1Va25MRzZTUnRyWGpvTDlyQkdGRWNhVkt5MEdqN0VBSklObitRTG5pLzRnQURJTXpXUEJyalRHVEVSNVhheEpDSDJxM2tKSHluMFJ6ZFZNcGRDZjl1MFVrbGgxb2M4ZGM0QTNGbURLYlk0TnZnMG5KRzcrQ3lpWjJrOVcyQUF6RUowdG4rZmNzMnUxcEJkN05rVXdHVEFRYXIzb0RrK1dTTkZpdFRvczRrZVJGdEJSSnJ4L1F6U1pIL0ZaTVY4Vnd3NDdJQ1JZQUVSZ0VzZ1BHdzRTTE9McG55TXNiaGZMMWZNUURKZVY5a2pqd0FzbGhnS3pVUUc2Ui8zNW52elMvbThveWJFMkJYcWFPQWM1bEdTMlJWTTgyMmJoN0RJbVhEeFNtZUJJZHM1NDdGVFp6RFhURjc3Y3lJS2wrTFg5OVl3VTQzY0hWN0cyREg0T3Mza28vN2R5QU9JTUdiZ29tOEk3MkYvRXZJdFhHOHJ6bWRZNHErV2NhSEZadU5UcTVMQUdoTFBuK1FCRDh3Z0crQWxvekkxR2g1cUFuM3V2UGQxSElUYU9pemhYSUFUQWRTbHdLZ3kvWWhDbEtJNGdmS2VNRXQycklzWTRRRktONlVZdzhGU2FLOWpBTTRtcndlVWJBUHMyVS9XdDZ0dTV2ZTMrZ01ibjhqNnVUM0lzdW5SdkljazEzSUdpNEFCb1dZejZsNTlFMHBuakMwOEp4bnpPT2liOXhvenpOY3ZPZHI4bDR2RTc3cmF1MFpBTlVqQ080aSs0YngzN0VpZklxcVhVc1doY1hpK2ZINU96bE9Yc0M1Y1hubi9WMHp3Q0lCdkdMWjlrbWlXMGZNR1BvakNuNHNYRG52RXFDUzhXZ1hLQXB4YXpiNWJtMzJIY3Z2SG1VS3B4a0dFbmZzamthRWkxWDM0WFhhTVNqd3dQaExOUXQ4TENZdVZTMElFQjJ5V3Z3cTYzYUJPV0JKUjlqcEZWdDRDMXBvTW9EaG1jQ05qSWZxeWNXbnY1RHFoZGxQQ2laQ3g5Ukt2eVd6UTM5N1I5Rk51YVlOSlA0UVBWM1dPVHRrcFdkbTNCNVVEZmZEcFdKZ0h6SHFmczdJVkF4MGM5M05OOGQ5OWkydnJKVUJjcDRmSXUrdkZrQXExS2hGV3lTK3RZdFZqdlhsMUZQWlZ3SjdQSWNqZDc1Qk45dEZrK0dyVkNsdVNwaDFLdWRSR2NKV0FrOUNvaDBvaG92amJ3cHRaZ0FJR0VSSkhVTkNXMFNBck1PVVF0VG04SWdKMnh2NDVHbS9HVXRIRWVDaU81ajB2UGR1U0pPeXpQUG53T2pIV0JRM0VaOXNSZ1ZKWngzdEdHT09USVhjR1R1VWR2RlpNcVJrSmVIMXZUckl1eDVJc0c1WS9iczlNT2wrdVpzZEU3Y0NyRzA3clFpQ29mQTFrdzVIa01TMXFFZ1RTQ1Y4WjREQmMyb0lHL0tESWhrTVM0cEE3bk5pRU4xcWlBRURJUERtcHVaYTlsVGhINmtoWWVSSGx4T1g3MTVjVktETGJralF6cmhucExjdGlwVWphZldnMldWY09hbERGaTErcTJNaSszYTFBTFRWcmplN0YzMGQ1eERNSjF6UDJuQSs2L2FuaTZ1Q1Y4MDRucmVuQ1gvSFhSNnJPUjRJVkpwckZjVlBoZnovQWxOcTJHUnpHMkVEOUhBTm5UUEFKK21JSWpycGxiMWROc3pqNDlWR2hYVkgrTUVHVXpsTDFQWGJIZVljbGxSUkg3ekFkWGdGT3FtTkkxQzRRbmJBTWpvdlNDaDZIMkRTWlFRa0FOOW9nUjdZOC8xeFBhbThrV1ovRU9BYUlmc3hTenBkM0Z2YzZmMFRHWENlTWIySEt6eUhsMUJhSEdyalFjcGx6VFhOeU1ndUdVMG5DMENBbmlFQ0k4bkdHR3RxSlRXTUFDMjN3VW5CQU8rTFJHZVZXQlZxSk9pNTVBNmpBZ0F6cml6akQyUXVVdjBlUzB0MXVyM2NvVjRTa25oTzlnZ1FyeG1nMVYzb2l4VDNQSnhla1NWY1BYRDdFZHpxRmtEU1owOW9lbXdzMWgrQ3RkMWFVaWVWekg3eTJjRy9FZHFjb2tUNHUvUlNzYkRDMnhzbjN4R09JMmMvcmtOQ0U5V3hEd0EzYmcxQTVzQzJRdThPeGlEUVh3VWpvR0tHMzNETEUzcG5CbkNOWjFJSE12NVRKR3V2VkZoOEZUR2xRdjhROXlIVUVJR2IrZ1dZMDZ0SDV0VEpySmJaN3hoSmZKMjR5SG9aSUhFMk8yRkJaa2NkMFpYVUFBaUpGRDhNVlBHTjVMbklZandsY2VCT1laM3U2TEQ3em1MWlQrZTdYcFNxekFSM2p4R2RmWGk5eHprVkJJekdOZUE1Y2pTSXpFS1hiVTRZNndJUE1UQ0tmVVBaRDRsRkdmQ3hjR0YxYnBxSXl1TW1QdEFBd2dEWllpU3N5L0Qxc3NPOE9IeElkbUlMcWw2eEF5UDhCd2dqWVVOeldQZGJoVVMxOGRuQ1dwMjFuUXZROFcwaVJtWmJudnV6UFJlTFRSZkViRjFxTnpyak1QU0hhMURyOVdDZEJ5eFR1TU1GTXc0T3o3V3Vld2E0NFFuNkQxaHlCdmdCRWoxOGdnbmthNEFDU2tjenpYaHh5SHFPTWVRYmdKQlE1TU1oWHBkWkJ0NzZLR0dBd2I4amw3aE0vYktvWVc0b09ZZmYyS2V4ZWl2bFVVWXFMZGozNUZHbFhhTVY3RUQ1T0lORFRNNEphdUJLMCtvTXdzbTBtL0ZXZ3pwMG5kL0s0L3FCZHRlMlhJcndkaHgrdVpjQ1lvUiswMmxxd0N4M2x6RThqTnRlU2YyRjNRaDNEMFE2MVFNUGkwcDU2NEFpQmxBZmFNREJBUHNVcTFnRTNOMmlodm5QRi85ZVc5RmNiZDJNL240MnJOUWFjS0JiQWRwK1p4eVNFT1BQQzVtN20va1VlZmcvSnc3TkIzcUpoNWFxNk92amxZQm5EWU9BbGQxaEU0cFpzNWNBNXd6d1NadXVKTGtXZFpISFpWZDYzV0VIR2hFWWJSMzIrc3I5MGV1WTNZRU8xZytpMFZNQ1hERXZVMzkyVTBqKzdtYzlOY0h1UXFVU05jRlFldkowRUZtc1N1a0RBeXlXdk5tQlBqblMrdUNHcjhtaEJwdzUwbS8rUHF2cks4OVRlSFpOSEhVNGd3WFdPV3F2OC9yUkJoaFdWUG5ZTHVHaHl0elV1TWt1dzdhZ09wYm5zMjQwVzh3Y2FOZmVxYmgxR0gvVVlpOE1JTFkrRC9uQVY0ckRQL1JEaEZHa0NaZjFzTG9FSC9yaUF0WUMrL1VZZGtxMFQ2RklheitVWkZVVEZMUXpvUjBoWjlPc2RwMThwQlkxS2xTT2tkOFBGdm1lanR6b0pmazdJQ3krdEx4bnM3V0pucDBNc01yQjZZRm9TSU9qRFRBWUlOZ1BZNFRCVjh2amZiZUNCbWgwOG44Y1ROcmVPU2d2elZ4bDNWVUF5ODJ3NmNTaVVHUmxibGp2d2dEdm1FdmR5QVdndnpBb0FYQzhaRC82a2lvNkNVS28rRjM5c1I3bDdnNU9WM003WHdwUjJpaHhpSUxFR2cvV0lYY2s0Rm5EbUcxSE94QlIzbmcvSXlKbm4zMXhKRGQrNE1HY0xSYjlNbzRzSFFvY1Z1ZEdLa0lrM3VudEdxcy9PazhaYzJyUnlEUG5uUlUrZ043cFZuTUUvOVhZNEFrQmRGSDNqcW5sZWtwTnc0a0o3dHdPZU84TXNHakxZZ3VuSFgxVlFNclg1QXlROFNWWklOVFozellsdjdXZ09GZWVVc3ZsUEVZc2dJTU5NSEVXVFdoYjlWa2o2WEhZMG8rNUFUVkkxUkFMUlA5b1F6Q01TcFN5aGMvd2hYUHJ6dFM1bFlwdEh4Yjh1MVNSZFNsdTlMRUFhYjBnTmd5bXNCZ0NCblJrMm9tQW1hN0pqUkY3OGNLNENBbk9ZQ1NQNEtTQVl6TEFMaGU3SlY1VmFtNEhNdnlBYU1yaDNvcWFVWUgwTnNDTU5nWkFUZE02UVRKOWIycVZocms0ZW43Nkx6K1M3bUFBY0ZoSXlUOTRXQUlaZ1pKbTNmeEFTUTY0ZFowU1lQbE9jMGlwNU9oYlN4dWdjRHh3UUJKVVplMm8rcmFwVGhabHdzcmo1Qk02d0hxZ2JyOXFjb21rWmpIVlhaY0ZEZ2JZMTJoTzQwVTNqNkZhTUFtdWV4QWZzTHdZaFJBdklFdzZSbE5nU1dYYk94a1BkQU14QVJVNzFCeDVZeCswK3huU0FkSnRibEtzaitVQUZJVHdwbnE5TVFBOHd3TURmTkVOSk92UG0xUUN1WEt0d0RJVy9na0EyQjVEemhDZllSR1pVK0hacjNoRlJjcTJqZno0WEJFdUhNcGdUVzRYbjFUU0pnR1czcWpaUlFBRWMwTTlVUThPbysvaXV4SGdXd3Vncmd3N0loMHJVWktxMDV6Q0EyNlZZUmQ3UkFKMHNEcVNQaDhVS0tDbVlQUm5sQlFlbWhrT3c5czJPd1pBdERydnYvMGlBL2lrYlhQRlo3SUJFOWMzY3ZUTkJGTEJQdVhFZzNoSXFDZWlOVXl6N1oxa1hybXI5TFBuVm5tTXdYMUw3ZkFiOUJjUEJuamZQSmpPQUZKTUF4MHRYeitxbTJwYnBQUlZqaHo3aXpqTVlTYUNaRUhYblU3ZG1oZkE0NVhJdFRBZjNSMjdqcUcvSThRSHNnRGk4MUs3T3RxeGVQc3lkeWZNeEtyNldrMEkvSCtkMENQdElxWkRRNkxVYWZEalU3TnJtZXQrMTNocER2dDZzUlhJVTZ3eU5kT0V1Z1ZSeWVvbnIvdDlNc0RLN3A0U1Ezd2RBbXhUeDAvSXBoZ01aRkZpZXlKb0VRVFdjV29qbmtTcVA4YmI5czJ0Y3piMnpWWHRab2VaUjhxQXhKT3EzaVlDb213WUhaYTAwNmZMRFMvZzdhWkVEY0FGNG53WEtUbzQvbm1HRERob1NqNVJ3bVJQT3RlZisrWHNYVGtHanc4OUlPNFQ3VHZQMzk0WW9CVUJYYXNWSmNVbDUxSWo1NUVrbWZTWUl0cUx4UkMyWkM5WlNYY0ludGR3b1h1aGpkTTNrVElSQUdrUlVmSFBOc0VEM0d5K0NGbWx4L0FBb25JaW9JemRKN2hjblVPUmhKSGoyeW14cTd2UlcyMWFReCtyNVc0K3owUGZMMng3VDJRcVk2RFpod3VKS3QzUURmZldSQlFGTy9BMDFvMEJGTVprMGYvYVpza0dZZUlJWjV4U2R2bStVWFZmWHBoamdiRzJ5NUo2TkxQSEhkY1JTc1ZkM1JZKzVrNXNDckwrOHFGZTRCYnc0eGNYWmhQSW1US0hNY2Vvdys0STJGMG5uTytmYVRjaHl6enBlUFE3ODRtSExVNitnUG1PRkE0UjNKUGdRVTR3enloN1N6ZjJ2cmNCZGo3WVRHUElYL2ZPcXYzNjNURmMyTUJSOFhvZWZURUYyRTM4VVVGTlh5Yms3d0UxZkhKWnQvWll6bjdtRWFia0RtK3FzOEJOQVhvekhGd3g2bXY3RnJXUnp0cXYrekFBejFwVGlPZ3VJY2t2OXlHRzEzcFFBZTliNUdLVitNd1dGTGl2Ty9FYlM4WUlZbzZjcUNhMzdwWTRBaWdIZUFDZWcwK2Z6OXYrK3NKQXp4NmZuRmJmeWwzWkl4UFE1ZGlOS1MwZnlLRlFEb2FqNGRIYjdxdUZiWVpuQlpFRkdEa2NQVW9Ra2xoWFdyM3ZHSUJEYjJSMk9Ha0k2TVBBK2E5dkY0Ri91aHB2RTlmNDlGREhzdEdmOTVKckVYNXVnUmovWWRqdHUxZTFjeVk5Rnl0dGgyYnR1VGxwWVNDdi9iWWF1L01YSHZpNXZud0ZqMnZPWWtJMVAwL1Q3bTgycUJHckpjUTlBN2pNNkl1d3E1ekdiSGFPQ2NOR2Z3REMrSzBiZER6WXljYU80bC8zU1RRQisxeS9WMXAvOVVuUHFBazFRVS9oSk1VdTAvZWI5T2RjZE5IZkJDYmIzelNaZ2hpOSs2V3RRQ2xwQTJCTVNUbTUxT2NHQXpzVDVwN1dld1pvOUdza2V5cXdZQU9nMzJKdHNhVjBpUXoxeUZYNHNOTmppU1N0bStxY3BnanY2cmZuN3o1ekFhbHpDQUJUMVdDQWRkNDVqdzFERE5WaFB2cVBkN0htN0w3V2FWZ2QrVzlBUnVxQS9PUUxqeG9CeXkxRmV3Ymc0NWFCdXBzQ1EwTmE1WGpkUWlwOXhLb01GcURIVk9ad0RLRlBkWERhM2ZmNlpkS1c2SmMyVWRXRHFNTUJzT2gyVlJ4U3k2YzJpUGxTYkJwVzhubG85SFJWTit4NlNWWFo1bzEweXZvc21ZUTlBN3hqSUc5RlRGTzVDYWpHWlJuUEV3QUN0UW9VMTg3WGJWZEpzMmVBSjhRaEg3SFN0amZlVHVrMWt4bnJpdUd4VWw2OW5zOFBDOUYrUWJweEg4cmR3MmlsY1pGcmlsZzEyVlJhbElDWWRQd0svVGNHNEx4OFVGdEFWcDZpM1grRFgxNm13M2ZxS29WTlFTMzdHT1FJQm94NDIxOWJhVHVOakh1NjVWTGw3blgxdWx1RTZvWVo0TXRYakZQQXJDNTNSbVg5bk1iZDcwam5VTFUyREx0TERFRG0vcEVCOEVwZGVYU21XbnN0OXZwTnBNdTdWeFkwdCtHazc3QjNOMDJLMHJRSFFydy9idFZkZG0zRWdtZmJNNzdKUmxxSEdGamp0SFBoYTh0QTB5QVgyTUxuRVVEQjRwSDZOSVZwTWJvQTBvbXZVOG0yQzZGY1NRQ1VuM0dSbGdMMnNtYU1vUGJKNS94c0pjNzRUQzR6ZVhmNEp3TkFDVHl0dy92N3k3U2RleHFrWlhWRGlWaDVpblpnQmhCNGZQdFRhNHFqcFZyalpOK0JRRnk1bHp6eU9CbWlkMEhYdUNkWHNGUlRYSXJaNVhoa2dIZEVnZ3ZBdUZzSUtLTFFFZmJBRStjTXZuSDd2MTUyWUhwRmJ5ZG8ydExZeTQ4Z1RsNjAvUDVJc3puTEdkUk5kbVhwR0pHTUtsYjc2VWVHNXF0bXlmeHBmNGJQWE1mRnhSek9zbjNLZ0hsQWVFS09KZWx1QW13TVVGQ2lQZXR2aUgxQ2RqYzdpaDYwak9QNUVEUFVMSkFiSXl3OUk0TGE1cWVrbzM2MHd0NkFyM1kwTmN6K2NDaDlyelpEWnYyYUQzKzlQR21VN0JNS2RwY1Bab1QwRzFybmJIV1Y1WjZVUSt3VlA5Tm9aOHVYREtDbWZjbmxPVlptdHJlZjNmUW55NkR1TTI0N1k3WWU2eGtUbG9JRW5aN1MzL3Z0WmZ5Qkk0MTBZRG5iWTFlOWhsNjhRLzVlcno4YzIydU1yMUZISG8yaGNMVVBqd1FaSlZiVUV1YTA5NXdPZ3l2d0Y5akxTd2JZV1ZxZTUzbWpKRmw5TXc1OEo3RU1LcnZLN2xHYTJrbUFmVWpGUFc3T3gyT1dPZXgvalF4Wmw5V1dFUUJYaTIzWW1mbDhCT0lYRXBNQklEQ1JnUS9JaHYvWVB6ZHhBaGF3RkZYN0VEVUpnMkxNSlFPOGJ4ajFVWFdocGRadnpaanh0ZDc1WEdDMXc1amVEU1ZrTWdDZVFMdWZkQ1UrWXgwWm9ORFpBckRHcml5SUIvaU9xVklza004T2t3bjNob0xnQThTaWRSQ2dDUHNoMXFGL0M3c3U0cVdqcjJ6TlE2dHU3MWNNTUFQbVZVdHJDMCtKK1VZcXVPYjdoMVRYdkdjQVkreXlzd0ozZnNDWGVnRitZUjFWZ0trbzN4YjY5elJBcjcwUUlnaDYvYW5lUmxIUG5VOFduRW9XVlZTb0UzVWYyWlFoeHR4bHFVZ0FqWDZhakR3UGdyczhjTzJFQWFZRUtKbmNCRWZlbzdidWc0KzU5ZW4ycW9EbDVqSnBQYlpybEExR2RwTUNDMC9pL2xzaTRMSVdqN1JseDlKYnVrZjlKcUJJL0FSY002aHZEOWU3cjdDbEtTY25PYUlDNFFNRHZYUnBieDI1Z1FtNDd6NFg0bG5HRXl3aDFWSk9KRUNhbFY5QUNhT1hBWFhnNDVxYjArSXFrNkVBNzJ6RHFmWUlPTzdkOGVUM00wWHlNLzhoRVhCMUp5R3R6bzVTL2JYN0FMUE9jV0ZubDN6RUcyVXA5ejRZQ1JReE14TVpoRnJIbTNNdERickhvNHRvd3FvQS9Xd2hXVHJVcUxIVTB2RzVYRFBBdThndGJuVFFxMkJFZlJ3SDhPM1VGQTB4K1hKbkRKRk92RDdFTnVNVkE0Z1hwVCtvRGZ2MWRiWHZ4WkZacG9hNlh3WnlxWmZSaUl1TG5CZFd1VjdOWFhuREZJTTc5U3dKbEpJWXQ5VVlVeXdaUmpINDAyMzJsZk9RcThxTnpUL0Z6V3F6ZUgxSC93TURES21DaW0weHZqNmdva2RjS3A4amMzQkgybDBNZ0s3V2ZaamNsRU5WV0E4Rzg5OS96UXpjTDk3dnpRVWNROHFOREZ0VHNZMHNoN3BPL25oOXoyUWh0RTk2TWdJeW9vMTBhRklJN0t1dG1BeDEvZmJRdFZIM0Jka0kxRzdYZW5mR0FLTjR6YnNwZXR2Tit3azJlZ0M2M2lwdFZqWjk3S24yNnlUdERuRFlZWjA1MVdrTE1nZW95OGFXdjdScWRoeWZtZTBCZVZTNThUTzRNbENGVDhDakJidmFoSFo5MldtVmtRRVlFcUFDalNmN255TTg1TXJWekEyQ1pGeWtTeDdvN2xUdjdwaWhOVzVYNXEvUEdPQzlTVmJPSTRKc1hjNGZ0SU1hajdMRlcrUTNMRVh1aUgyQzF5Nm1BeDhUUXNzc3NFQWs2ODh1ZE5uc1dwdFZ6NkVZR1Z1clV1MXBRWFhlNTBBNzJiUU9GekN4NDVkdnJQMnRLR2lrekZVcmpFMUlKbnJyamNrZE5IZXlqQis5b3FQSVdzOEFHN3ZWNzZjTUFEenFoQkVNTHVZOHdUdHVyWDJMK3ZWZGt4dDZCNkNjZC9ZUzd5R3V5MGdLYjhsMXZtOTF4ZWQvWmhXOUpZSTU4OVBQZVJNVlZvUFVESzdxeHZCeUg3blV3K1NyL3IyM1F0Y2lHM09SUWVTRk1Yc1N3b0taUHlobUVRZ1l1TFRqclRLd3E3czdqemw2K0hTWEFmZ1Y2emtEQkxmVmdzSnA4ZlVNYS8zejVRMEQzTjFsQnBvU2psUEpnaDJWZFVNQkRCbWdubHFjOEpNVjh1RGFIa0VkY2N1NkNqdFVqZzJJUTNNYTAyVFFXNThYUm8zZ3lkalNCZFNhVzZJQUFDbU1nV2JNa042UUdBcGpZYUlLV1J6UURROXhOaW93WmhEUlBVWk1mQ1VYa0N6MEdsTStaNEQzWHBQRllvTnJHbStQUFRPSGZ5NjJnelhUUGJXY0FFS0NJYkc3REZyRzFsMCtZUHlMeFBZM1JwVDh4dUsyZ0hVTTU5bW5hZ0l6cnZXY0Z1elE2MnIwS2M2MzQraVRRaThkejZseUo0NXBCcWhZS0lsa1MwSTdOZXI1N2ZDeGZVbnl1eFM1dEdKVzhQcHN0VVhFSitZV2dmMUJ1aUptOGd5Qk1iNUtTOUFaQXlBSjJOQnZ1UTU3MFRJSXhhQzJ2d2hiQVUwNnBjdkJacVFRZWFqQUhRSUFvdkdpNEt1UGd0OXlRWk1CVm5KOTd5VEo3eTVKKzQrQ29IWFpXaGtDcTJMTllES0RBYmpoeTdBSzVVUCtodnJiMWVZRllFbjBrd1kwV0tSSmVGcldyT3Zad3N5TEx0d1BKOGVHVzdpVmk0emwwUE04UEV1REZ1RC9GY0tRaXZIL3lXdzBVcjk4aXdINHBwRUs0TVMyR0E1bFRpMmk0MG9HV3lickVNaCtOUlN1VUxyTUdBSEtFTjFJZHdHS0ZPTFRlTkhiV2ZkRGdxYjg3MkNtRDRaNGVNZ2FxUEd6Sm54MXcxaVJVckZzdko1UmVLNS9DTVZnYWdsNThTSFJlUUVTQkp4MFRHa3AyR1J1NllrWGZEWEM0NWpYUUNaQXFyMHRxVGIyNzFZeTNoUXlEcVpYVjA0VGV0SFZGRElWb0h3S0YvdC95QUJ2YmZSb2lRZnBTQWlZaXFIRGxTNmZyT2dkb0VyMUtPMGxkSit2N1Y0d2dWQnJpeGZuZWxhelhUSUFiKzBmWklCMHNGaXdkZk9CcEk0enZRMEc0TDlzUUJCSHErQlRRTnAyVlZFTHNseXBPcUlzcC9wQzU4cnUzUGJwRTdFcjJmakNhQjhXSmlCalRiT05SM0pBdy92T0Y3VjE2QXVLRmd6UUlFemFMUVlRRHNCNHFCalkzMlRvc0JaU3lJNFlycVdzM2VwUVo2SlhpVFJKRWR4bGxQWitLdm00WE1IUE01N2NTS3NlMDhMS3RyOVZGL0FHa1QxelFNTUwzTnpqakFBUm5hRGNrUmVoSHlMamZLaE05bnZqUmszTVA0TUFXT2tFTnpicHJKWVIxQ2VMSThIb1RHZVhIaHBVZU1BWDFnV0tLd2FQdkxPaSs5YlR4NUdoV2VBSHZIL01BRytzWG9ETkcxdHIyWG1PY21CNHM1cEZ1MGRITFY5SWdQc1IyUkFJMEJjMWpsenpNQm5nd0FITDR5WS9QMnFWT1RkbWJyamVub1lubWhXMmJHTWZtQzJGMmpGZ0ZrVGt4Z0VyV2VNRkJuRlVNNTkwU24vOFBFbXNGbEJlYkFLS3RpVjZaU0RIWVBLbUhuY0U3VzhqaEFKbWpBRXNDNmJCNXd3Z2o0Ylo0ZEJJWlIyM05EWFpNTXpGU3BsalNYMUxqYlRaRjVxNWFyS1hDS1JzQm82SEhiSmd0Z3o4b1p3UWxwbndseHU5ZHNFZWdIbUJJbEZwMzF2ZjVHeGpTUHBpWlNabUp6V2QvaDNQczNROTR3SG9RYzR5eWZ3MVdHczJEUGp4cU1ra0o0S2hnc0tocG85MHJJdmtIb2JvQkpRTDE3ek5BRHNPUU15SkRBdmdocnQxNWpsWkJYV09KM2JsbWUzTE1xcFV4UnhhdjRJb0JSRnc2UzhJZnVUVitaZjF0MHJFVGVwblkzZXZlMC9meEdWdDNwaUdGRzdTNjNhNFVkWWhvL2pJQk9SZ2ptMlNQT3k5R1RkVUFBZ2c1ZnRvcXRJeUdDV1RkbVl1c0p5Q3FkcWxCSndIb0VrcGlFMmhaci9GOS9zWUlPUFVjUjVyR1VPNDFtNFlrckJ5aUZ6VUZBVVN6eFh5RUQxcURudEs3TjZXVXVBNFhoWExqVDZidlJMWVFnTi9xamlzWTUwdTZ6eXU2M3JBaDZmOWszSFl1WVdRTy8weEJJQjgyaVJtdEl5Q1FoTnZqOXN5a1c5cUFKektEVk52aFBvV2xPNFFueWxnNEpSRFlCcFROcmg1VVhmOHlvOFlZSEtBTnpGbk5TcExsekh6R3d1NUIwK0daM2FqM0JETXFLdzRtM0pIOTRKS3dEVFI4VUpqR0hGcitvYU9ZdnVoQ3Y2U0ZUQ0h4NjU2MDltSFpvcTBKZ3pieWtqSDYrNExjSEpXRnd4UWdCelFjcTZzN3FEY2V3UHVoQTF3bnNkNEpka21QdHdNSjVnWGtnWERCQmdNZzVCTXhDdytMMmlTNy9jd1FIWE9WV2t2bkdVT3dwazJJZmpEMGFsSm1NbjliT2pxcjNTVWVLc3Y0WlRCeUh1VFNoNEhBd1JFZ2Y2aEV2R21oZ0d3T3lCN0RqVmtlWVZFcmk1NTB5VzZtVEtndjJQSURNZWdCYTVGOVhUQnRlOTN4UUNHUVlxSEVKQlBsaUpVOGl0cUlWZHZkeEVXTHNXaGlDQUlmOTNGQUVBbHQzbFg0eVFubnljWDJvMzkySzFsdU5jK25hZy93UDJWWkh6YUx3MjdvUGNNWVBlK0IxdlZmMFVKVk51M2dRZFpqM1V3YVNSWjd3c2E4cFh1UmFMU3J0bTh4M3luWWVXTy90TE83amRVQUY3Ym1wNHFvQ3NDMlpORU5udjBKdS84Wi9rQzZNVTI5TGtHSHpNQWM0QmhnTlY1OURzUHhEb3lUOXVIdzNuVm9yRjBqazBBZjcvUXc4eGhweXU3RHVDUHcrS0Ftenlzd000STN4bkovb3pGSVdCc2hSb0VZZm9wSUc3blROdEJXdFFKM2hhZ3VOMjZia1BlRmxDa3FYV0VlNlFLZStuMXU4cnRocEN0RjErb2xtZlFTZDZ3U3VVV2I1c08zdTRES0dKeDZvajJ1b3FwbzVmMHZtWUEwODM1d1FGS1N3MkJ6UlBOZGQxWlpsMUs0Q2FTNEVwT08rMmVrMHIyeVhYV29PaEo4RjdKc2wvZkc4ajg4SVZzL3lxaWtjVzNkbjNDOHNGLzY3SnI5OC80cFNYTFBRTHhUL1ZPM09rZ0hBVEtwUVJRQUtMY2FJQU8rNTRGeEdodWtxYUZQVFFHZHlEV0t4WFRvQ29tUU1GcVAwYUJiakFBU1MwWXFIMW9sMnErYmNVdTYvRXdiakpyVlhFbW9UZEgrQTVLaFJONit0eEpqYVRFNkcwYTBzNHVkelJIM2tWQkZIZWJucEw1OHBJcDVYTnE5REpPdHh4TGhHbVFoZW5ERjdnL2IxMlBjbDFoZ0lLOHJXK3BETW9FZ3U2UjZMdXZiVEY3STI5ZFJrV040UUZKbWt3QXpKRnZ5QVRLQXZJVDBHcDBSTWhaZmNZQTcyK1I3cXRPTzlOaWJ0aUFRY08waXJ5SnA4MFFITndwUEtJK2FscTRJa085YnBJM0k1dkJBM0pIMWtIKzB2RTRNdU83aStHUWlEb1pBM2UvemdBK0RXalR6UWFlbmd0NnQxeEdrVmlmZkxqSnNDRVhsbUhTOUJqWGZqL1hBOUdQYkVPQ3R1emljaXJQY2NGY2RrUWF3UFZDc0NGUTVHMjVYL2VLM0ZjTUVFcEx3UkFIc0JRaGZ6K1JvRUorV2J0WWd2ZU5BNFFJTW1peGJHZ1RIYnhBTmJ5WURTRGQzS090ZlR6UkFSSzNJSEZuTVRkV3E3bVRxMDEyK1U2L3luRVpIeGs5aTdsSzJiczRDaW5ZNEFISkhWUGFwTFFhcHZLNjdmY3lwV1FuOXlEOGlXeGZSM3hsaHRpdVg3TzlPQWF6Rzc2NmI1eVBUR2d2K21IL2xvVU54NjYvUDJlQU4vTHdteWtaYytRaXdvbVk3TU1UQ0pFYUtJRk1tOGpEUldEZFFJc0JTOVpoMm5nR2p6aHllZmkyRE9EdDdzSDJTQ2RHUU9pMmtRWHdzbkpxUDVoTlprbi8wQkNzU2pjVU9KUWNJV0RVWjRERFlCbFNwSGx6ZHZpZ1c5b2I0RUJaUmpYRmdFMVpXMzVvSFZiL2VzRWRPK3BNK1g4UUVLZjBaM2srTDdOUHhLTUtFMk1zOHd6ZTdHU1Q5U0dKNFA2Y0FkN0pMcW5nbytscnJrTW9EU05ndW9ick10QjlyWXdXV3ZWSVVYRmh3VWZERW5wSkF6eU9rK0JlRk5GcUExSkRRNkx4TEdqOGpValR6MG9EMG00QW9jZjRBZnNaSUs3M0pkdDF0SDl5MFQxeGZnVHdDdm5HOUtjYXhpSEdIMTh4ZUFjbllnOGF1UXd6VUNsMUhETzJjOXpubHQ5Z2dLV2JETmFTY09haUV1OFpOTHBnNDNVTmZjVDh4bXo0bStqQXNORlg5RDlqQUhTeE5YVzR2WU5VQVFtbUg3cEZpZFR1Q1VrVWtjeFF0MFBDeEpDUnpoT200QlI5eGdCTlBzR0dYV29Jb1FsT1FnTkpPY2Q3eXM1dkxlTXV4ckdGczVhTmJZVVN0WnBtQ05zNW1LK2xnY0NSVzR2MlRJQVFiUUs2cklpOTFQQ2xPdmt1QS8zckRIcFA5KzFJd2YzaWxyME9sRXdDR1hVQVFRSXFxL050NW13MmVpMUF0ZlljMXJ1SEFkN1huYnp0dDNCMWV4TDAyNWlBakVVN3pzWWMvNlhPNStVWWRqUFpuYlUxV0FEcVh6ZGJTYkRMQm5adXBvdWt1TWxxWVF6MThvTUJJRUV0dDNycnJsMlNpdG9jTllUZmFoc1crcktJQnMwU0kzUHY4a2NseTRZclg1emE2WTg5ZldSN3gzaldqU09PL0NIeVZ0TzU5NzBXS0hEZ2hidE9rWFZDak16dkxmVGRSK2dBRkQ1OVRld3pCbGlPRTl4RzFHSFNHeTZ2SFlPOWwzN283UWpaSTlJOUhzZ2VQVHorcHVhTWtVZWtnOEVGWkUyNWRtS0JtY2dmU1RhRWhOdkc1d2o0SnBHRGhNZFZOZUw5eTk4RmdJaEJ6R25HUTFGbUdlTnVmTlViWWkrTkhPM01BRHhrUFFjZ21OL3MyQ014UTk1NDN0ekJkYVB1REh4ZEhQdHhxRFRYNGVUcXg4Qmt4b3ZnbDhnbTh4REQ3TXRnb3ltakVUdFZLT3RLTHJacllwOHh3UHR5eWFVSG50S05Ic1J0NlNxSjF3eFhiVkVEak9BRTA0Nk1hSEppRlBBVXlDMWxnWm9PRFEzYjRsZ1FFbXNDeFQyVXkyb0ZleE52REI4TjRQMkV0QjlPRWpWbzI4YTA3SzdxbE1NWTltdDBlbE9pek5sREh3Vm11bXFwekNMcGRGdWxFSS9nMnRtcVhpTTA4My93MWNXR0JLd1hXbk5JejFXNkV6SlErSDN6Qm1DMk9GRkpybThnWnRpdjBjOFJoaWdyc3RGR2xBWVhEUDBqY1dGUGFIM0tBSWtlSFk0ZitzbTVyZ0NqSTF6dWtZVkU1cEJVbmVaZWU0ckpBanhnSUxhSTdhRGYwSCtZVVhOWjZxRWRKaDBVWkxIRkR0THRoalZYMkg2Q0Via0xDNjdTN09TNDhQeEgwYUNiOHByT2FTWHJ6WGFtczdURDVWYVRkTWdZZkNwMG5LWitEMkJxQVBWZXZYR0VTQTNUTXlDdGxqUDUyOWxpUWlNUDdTQkc2MnZLa2t2V0k1MGtvbGhOMjZOeFdTRm1UU21YZ1FJR0ZyTVlCdzVhd2hwTk5aMW9nQnNNQUVJU0FZbVltRVBWR2lLSkpPc0FNczJqNWVubkpUR2w0U2dTbHhHSEZDSXRQWVdWQUxoemdDRTVQbjJGV1lpc1ZaMmpBUlpsbC9PMmVSTzVtYVdKT1REbEdyc0FHclV6anc4SUcxVGlPenZBTmJHLzZkWlVGdXhDY2ozdERuQVFJSEZpbmhQOUg0RFJCcEdOdTRYVFhHODJjdlB5L2dPR3ZMcEoxRkN4V05KNWE2MzNVaVFhTURnZStHQmRZSXNuSFRobzZjamV2cGNCM2pmWTI1NXNIQmtBTlh6VytjV3dEa2dtSjhsc2EyNHVYNjlheTduY2wrdlcvV1ltS0V4Q1BEM0wzQitBWHpFRERDdFFTaDBpVUV3ZUZCRHVpNmlXclpYb21tSjhKTHNmTXJDMVJ0QXhJQjd2eFQyd2M0Q2xkaUlpMExWaGhVR0F0WUVvQ21ud1Q0TGt0d1dUWERObFNSTnFWL2J0TkR3a0hjYkFzSmU2NjRtdjBJL01nZFYwU3V0ekJ0Z1pJVWVUc3AvYmRkZ3VPeHR4alRJcEFVMHFLVmlKVVdBVTBiaFBqdTV4eGJUcHhXL0FMelVrYkU2RE1HejlRd0tNeE1Dd2xNQitDWW12aDlVR29iUnAwRXBaMW1ldEhvRXJndmoyS09ybzBsZnE3dEp1RnRmMWRUMFppRE5aSUljVDVzSEY1S283SDhPRWtXd2J1SW5iRzlFanVtVEFDQzZYWVlBNFlnVHFUQURjWUlEM2k3akVNVG81UDJSekROazY0MzFoOGRCWXl4V0xhaGNaWkczWW1oNko0aVRpUTg1d1BvZkI5MDcxY1RXRlM5RFhLV3JnMVVUTUMzdUlDRUFZU01rNUpYdUhVVlNPQk9McUordlV0cWVveUFXTGtNYTRnM2lHM0FQSWpKNVVaZkZpWWQrVmdvaHFKQ2VpRlhSd0Zmby9zaDdoNUIyTUFqRUp5QzVKSmZhNkMzc3l3NG1od3pvYXhORmxGeU1iTVlBekgvQTJBNURwc0hLOG55TjhsaGVLRkhpcU9JZEFaSjZrVEJWbCsxVkx1d0ErM1FaVG5KUThnaDFBM2tJYW5YWlgxQUtxcEJmVkhRRFV5NTFhekcxWWVuVktnSkY2SkdtWEJIVG5tMEpndkMxSVd3MjJscnpSRURDajF1OEVQdmxhYmtieldEMlFaY1hZT1c4eXUrditUd1JZUzNhMkcrOXE4dEpZeTR3eWJqK1QyWG5rVlVROUlraG5ReHhsOExLdWNTZXFoUWs0eHNZZC82WFZVMHJmWUlCM3NpTmg5R0UrSlErVEMvaUhMb0lqMG4vSzZwQzg0Q1FNVzJFL3Q4by9ZRUJpNHVsSWpCVFI2WVNteEZFcWJHU2dieDhXOWhiUDRiUDZSQm44S3VoMVpJS20vT0h6OU1OR0ljUHVLTVEraUYvZ3pHeElXVXd2UFZnUERJdlk2NDdpOXc0dHUxemt2YkpFd1puU0c3V0ZzL1ZPZGdzRGpQcWhaWGoxSjFrTGdhUEx3UTVVQUlRcEhkdnhjb3VneWtrTTRDTUdXRGp3RHA3a004K1EweVIvWEo4a0xGRVJaQU1kN0pzczB5VUFMbXJoTjhLekllMVl5U1BoczFKUVliZ0JDcGhwNE9IdW5UNGJoMlI0dGl6YkROSjlld3c3OVBUNkQ0Q0RERWFLSW9majBEdnJTQ3FYMmRKSEpGSnErQjJjNVNEMzljS1MvK253T2FRTnlLNm9jSjVaUjVCNGlNbWhGMHR2dzZpbmRPQi9kZXhqRW84ZkRldHEwZFhEVVVkUE1QbHZGUjQ2ZmNNZ0Q0SFJTNzdNQUVjamNHaVZ2ZVlmUHhvVzU4Z2JvVTRNVG9BZmhsUzRtSTlXa1QvdWtneFRGVTV6ZTBSM0RVd2QweWRKekJ0WmV5RWxnTzNidDdjZmMxRmFrSE9PMG93eGhoRitGanc0bHJrV0VlZGlmSHpDMUxIcmV6TENGZ2dWVlhBbDhMMUtOd29Zc3UzR1RYQVJZQXljdTdVank4MVFBcjFXTENObStEVUdlTitiRTVzeHVFVVlwMEcwekR6MlJuOGVsV2FPajNaODFpay9NZHZxQnBKMmdBV0psMGxpWU4wK3NuOE9pdEcvSndKcU5hUzBhSnRSa2FQbmxIcndoUjFUOVZaMlpRSGZRMXY4aDJyUkx4Y1gvUzhxbEhrT0IzRjZ6MVZsa0xJYmRQNkFBVVFFcWoxMXR6TS9QME50UHhKK2dabnlCVVF2QXgvMlBLaGpvR0d3ODk0TngyTkxpdlFZeGEyeG5COHZ6NjBJSVhQQjJZeEUwdGwzZWxmRzBVZFhFd1A0SitQbS8yZ1p0cWd5dXBRUC9ycUNnalJ2ak5heW5DU0NQMkdBZDRTakVhUkVBUkJxZ0ZZSlVGdDJoUVZ4RUVhQlJaUURnUitOUXJnVjdjTTN3T3R1clFMSDlwUURHbDJkZHg3bTdhR1dodnNpVjdhYXZoTU5LSWhTQkVmRzN3Wm8yWnp0enVsV3BKZU01ODdWOE5pZzAyTVhSaStoUmQvdE40aEYyRVNydkMwQVBtQ0FqSGh5dEtpWVFRSVVsWUlGeWJEV3lQb2o5UlJ6WTR1L0FZcXlSRWMrQVJrZWRZYS83NldMNklEVEl4WlV0L01UdHg4Y0dHQ0dodlUzMUhORWVDeVVIVlY3aVNjQVg5bmpYd1Zha1l3RThFRDR5eEtBK3oyY2I3MVBheFBVSGE1VWpzclhHZUQ5eUU2WEdXcjJQSlgwSlVFaW8xUnAvUTYrZk9CNm4xUDByQkNqV0lwNHhtUVAxc2U4RDZXL1RKMXF5Ulhiemo0VVB3ekJsTVh4NXJDVzZJTElpY0UvelFDZWt4Zk5YNmJ3eDhTM3FwQSt2MG5sdXhqZ2F0TjMybWJsR2pCWFBmQ2UwdWZEM0s4V1R6aTlNUmdzcEQ1WUd0QUplVmwzaWtDTlZrZDZ2azhnamErMmpNUlZpd1BGQk9XUFBlSXl0azcxeVIrQzlrUUtyVDF6ZXQ3UEZsc0FKQ2c5MG9vNVJpaHR6dG1pZlpkZjBPQm9mb2NCamh5d0wxR1kwUkhPUzVEWEFRUS9VMFA2MW94V0ZJQ3E4NUNPNy9PMTBVZVo4N0lYUXlySE1lQlFaZXUrTXVMZXVCeTRtc2dIcnZOYmhubTU5aXdYZTUwOG13Y1dRQ3B2N1UrMUpCK1dRY09SQ3lid2JDZ3VWa0xOYm0yOGRSNFFZY1FPdDRuOENRTWMwbjM3Rk1OMCtOYklsUktoT1BlRndPaCtvWkQ5Wm4xV3o0SmxBR0dOcExBc1BXdVFVQjM5bGNGaWJTMWU3cldPTGtzSndYYnhvcVJzVS9lQmhURzhwVDg1dlpZWEVPaFVFMml0SGpuRUkwaklHT3FCSCtsN0RQQitWUHE3clpKb3JPT0JlRlZBaXRadmpCYmdoWWFXbTI2MjZabzZhT1hLRldwU0QwelIveVR4R08zK3JtYTByRUtOQ0RHaWxVSnQ0WTFoNmZSTUZ6RVlHTURRNlU5L0U1OE9nU05nRHBBcm5JYnZPZzhxOEdwbFpvMjY2UUo4eGdDb0NwSTBFRStQMExhbmZrUmhxa3AybWNya1BhTUNJSDd6L0VPODY1dEpOZDlMZjAxVXVYZW9YYWlra1NXRU8zSWZmSXkzT1NRSEJlbmphZ1dqaWZkcER0cGlTRUlBSnJJTmFEMjB3QjlkWFFCNHV4N1BCalNqaCtSY2ZzSUE3MXp2bFpLRUpVc2p4eW1nTXlUUlg2UnpqRWQ4RWpWRDZFSHNkL1IxWlFuLzViT0FIbWs2SGNJT2tYZEtnQm1CVWhhcDNFK3RkZFNodHhwWjVrU2xtODR0Y1U1RzUxNEtqMUY3S0FycllLY2htdkROMlZuUFh6NkxDOTJXNndYSUNQR2NQaUx4eHd3d05wcjlQUklEeU1BbUFJYVJXTWlWek02RStWVVJXRVJjQWRCU2l6VlVCQWcrbXpheUxiU2hyZWVqZGJjdnlRMm9KcW9aYmQ0T1B6TzcrS0s1K3M4LzF6anIwNHJvUWJCYVowNnhJd3NESjJCRnRyZGwrcHVUc3dwaW9oS2p1OTlJQlh4bmxaV1RhandQWEZEQk5iY0ZXNTJSQ1VUVmFrcngrd3p3dm92ODBwOXN0OHdsSmxjTld2QjhTdWNZOVk2eERUZ1pnY3FhKzl6blJuN3NOWTYrUVUrNzZUOG50cXR3YVM4UGYrZUVVV0dZQzhwNTY5c0g3b2pSanF3QWVCMG9UbmNxcFpwU2R3WFFRTXVsRHVnL1RZb2xRQ1lMNnk4NUFlWnRGMmhGOUMvQ0JPZEVmRVVqcjBmZU1oVEI4a2RtS1gxSTRUc1pZRlRBYlJwNGRYbWRJdmhDQVlsQzFldHlYK1V1d0pOT2FnSThLbHhIOHJ0R2xmYkRCQzZTVXFPWEhWaGJKSUpDdVQyTUMwNmdYV0V4Tms0cXlJUXRKYUM2N05jQ0NZWEJkOWtMak1XVVA4UUFQdHF0c2lKS2taV1BPVWRVbTFpa2d5TXBNQlJ6a3dSQWg2ZStIUVM2Z3dIMlNjRjFaR1RVZHZ4MitjSWVtaDBTbWJPMjk3VndBbHpzS3RnT0N6Zm9DVFZBdEhlK040eWRycTJzQW0yRFhGSjFMbjRLN1orRGVVZmJwOFR4Vnh3RDVvSWZIVW1HSkJuNHlKQ3ZQbGZ6aDd4QVVsdHU1dGE5V0lDb3I1a0U2RzJIeE5BazJyaFA3R01DMzhrQUI1WGIxZTV3RE9lUm4rcUNxMFlXZlc4TzFTQmFjZDJnYlJoYnA0Y1dEVmxydnM5Z3VjVUIvUytkU1kralBLbUdzNktOUkF4aVVXbUVKRE42OW5wOUc3cHZJakZPbFBvampHTkJNckJtYi9JZjhRSTVkclV6UndBOW1la2hOOFN1a1o1ZFkxNklBcHdJL0JrRHZGdVdKK2d5Y0toa1JQY0hkOFdTMmVReThBSVJmSFE1bGF3MEp3cVpBVVl0NkwyTFdQWEVoMFB2ejVBaGhlMjJwUFpaaWN2a1JHLzNSK2RnUWVzc1E0QmNGaU5FNEN5dTRVM1ExTkNMZy9kWVJFOWp0dXRJZktBcWh5dFNyZmQvWTF5UnVmZ1h2akdQb0drVG5tdkxCV1VCOVNZKytJUytueklBcWdOdGRtVHNrL0J4RW10RzNVbXZQc25NSHlpblRmeVNQbkZXdS92eGdrR2lacy9hUTVxMnM0V3I4TXlnV2ZkNkxRQzZzN0lLcWdqWVg5NXIvS0dhaTJSb0xaYWRBTjNyV1JadEUvcm50MHFzYnZVVXJtWW11Zk5DVUtLdGwyaXNlU2JvQVZBUk5mUEF5dWx4NzQ1emc2U0R6MHVCdjhRQUl6YTJDZnhsMlVDTnhuSGsyc0YxMkFmNnE2M2J4cDg1V29GWWZOZzdDWldERE0xNjFFVjdCdWhhUU81dEpUdXUxSEpadTBjZVlCVW5nQldrREN5UVhxdVphZUpvUURkaFNmeFg5OUl4QmJDR1NnTElWK0lSY2JNYktNb295dDVudFVCVURkR1lCTUZRMjQ5aVFIY3lBQ21CWWQxdE5yaTJYZTJ1SGRXNDB4NEROUEg1WDl3d0l1OVpTWWd4Vzg4SWNnMklHWFJiYjdNODU2bmRpcXJsZXltTVM1a0k3TTFrQThlTjdNNEl5QmZTV0JYdTYrNks2S1pqYWNJR2FFNXY3ZFZUQ2t5eVVQV2hIRGFwOVhSMTZpWG0yVGZXdjhzT1p1cFQrdC9EQU1NVFpPQVR4VTA5cmhaSm03ZUFlUERJR1FHekJFMm9YejMvNlAzNUtCaUlweTVaY3ZKNTUzSnVHYWxseG9Rdi9CS1JWNmo3UTJrODdXSmVZdE9ZMWVsUmE2eHF5T3Q0NVNxZ0x4bHdBQkFqd0NNMHBKclNQVUEzejFzaGtwU3FFVEJNZTR4TVpBRVVwSVBFTUJaVjhsUmdLT0htNm95UFhjQTdHZUI5SFM0ZnlVakgyQTdKY1BZSnBaL1ZUZCtQRVFIS3g0MlE1NCtJcEV3K0FRQTF2VXVETGttTXhReFFkakRLTy9lRXhkSTZnaGFjMjU4cFhnVEl1QkJmNTBJR1V5TFRJci9KVUQvbGVrZVl2QWxZUHh4TzR5b0hPSDhrL3QvU0s4TUFRRk8ycFRoeVVHdmJxNktpcFdheGRQbzcyTEFSalVPWURJY3VvM1lGQ3ZoTkJoZ1c1a0srUUd3OHY1NDlaZlQvbGc2V3hqVTA2c1pRdEU5WFFRRHVKQllVSXZtUzB2L3Vnd1FWZ3RvYkk5TUtFZjlQRXNSS2NxS3pha0gzWWlWeThZblhOUGt0ak9mamR1OWRWMEZuWEFjN0tDZTloeFVSNkI5amtuMS9lYXVRMlMvMmNvSWZ4aEZwV0FRSi9SZ1lCOWhhY3p6d2szNmdHYjM3Q2hUd213d3dDZ040a29sc09nTGxNTXFLbkRSc1lNejYrK0JkU015ZUNGcFRIRVpXNE1zUUpLelFXMFgzcE8vaWFjME15RDlDRk5zcmhBa1lLckdRbWt3UnM5QTYyaDRBSnpqTGljWTJRZGRBV0RDamxMcTl3Ukh4NW5XVDYra0FvT2pWWDlmVjg2UWlNR2F3RXJ6VzYwRHQyY25ITzJoN0Z3Tzg4MndRcFh0Yi95SzlnSTE3a21UVHRJdkJ0Qy9WNVJ3V1diVHFyRC9velFleEEwa1o5SXVYZlF2MFVSU29OU1kyL2ZZaDYzNitGV2Q0TVBlbWtBVHd6SE5vbmF4SmR4TjJSRGhKNHBLOVpTVVhHSjEvWFVFZ2J1S0dBNEpCQld3MXhha0VWNEZUMi9scjk1RDJQZ2JBMEVFWVVhbTFDTGlRQ0pRWWN0eDhRek50bzI4NUJmZkZldUQ5SWhWL01sa2JxMG9qUEhsQi9RY2R5UHJLRTJRYkZYWHFPd1N1NmFSeWdBZ0Ruc2tKQUxLQ3RKK1RhY0F3N1NPNHpWMi9BSWxnZlFCZkprWmZYbVFEaG5pNzljM0RjVUg0M0tobFdqN0w1WG9jQTd4cmpJUGdyalhIMGpJS1VSTEpBUVJkZjJna0dUbVA1OTZXOGNqc1lFUkYvMEd2REpwQmgwM2lzZnh2UEhwbnN3LzNaV1RZcGxoSXdIdkJLTkJJbi9RY0VPRE9nYS9MMFNTWEpReGdZaVVIOUFVTWdQbGVEUDkydmdMM2JaSnlGQjlnR2NkaDNTWHM3cUwvdlF5d1NHRitEd3JOQ3A3eXFCaVpnVzkrVTlJYXp1c01NdmpZZThOazNOYWt2N1NNa2EwWER6MjI4M2owSDhZcXN6dmhCYnFZbGVDL0lZRStzRmVzVFMxTGE3cW5JNWhlRUFZd29QRHRhSXBwOGp5Wml5bTJFOUEzNGdrTThFNGFNWXRHUmUzL0UzWWtmRENvMm1NaTBtWUhsY0VBVGRCakR0SWVFUkUzYXVRUG1VclpNNVVpdHlWN0xwYnBJMDVjYzkwSFdDUFFzQlhBRGRDcVVIVTErYmNad0FRTUFiUWZuSzB4VlFuVjZ0N3VhTC85ODFrVzhLc004SzZDU1d5cW0rY01jUSt4cFp1UEhGclpNWURwdzhtQWlaS242elphQlJBQWRUdHd5YzFsa09OQkFxSlBXQ09EMEdyMFpYYzlDaXVYWVg5SlJWVExlWmFpaWNuY001NzMxaktNVExsK0hFenZBbURCay9oOVM5aFhGY0JYR0tDRmt1MlhVbnhmV29EZlZyZVZ3R0U3WXU5R3lrQVBtUnlQMm1BR1M2UEQyNVdBMm5xYTFwNzVXVlBXcmVjQ2dmVGFwenp3SlpUZ0ljUUsxNEFEZ2NYVyt0dDlnUUF1Y0lXOG4zRHpxT1Z4eTVDTVVnMmdSbDBVWEdIRXRCN05BTzlJOEQ3UkdtcHErVURwN1pkNUcvREJpT2lQYVJJclM0UkVWNEVCdDZvK3hrdHZrUUtlNmJIbzZoUzBEUU9RNnAzcjNMOGN4U3d5OXFMWm1uNTdURm5WT2plU2JRQ21PTitScXFkN2czb3dFbUlwcGNMOTdvV0xka1B3OTVMMWZnWjR2M3NTMkxjV0dmdW81THJydFIwTGhkMkcwQ1VndlBsc01JdFl1anRkRHdOdmdTSkF3UUNQS0V1SnAyUEhVR2w3YURkZ0ZyQVJBN1JSQlJKdENMOGNCd29aYWN3T2lxSk9rU21Td0l2Q2ZnV1VhZ2FLRXlxMXlid0JTQVI2dU8rbTZoY1k0Tm0xMFNsenFkNGRKb2JwYlRCY3FOUDZXTG1GWitlMWRTSnlReWRFdFMrVzRDUngwRFp3akplT0Q0b1k1a3dQcHIrT2tkdEdnV24xeG5HZ1g1WUFaSEpFSGpiVCtWZGRWMVpnTEpqWUxBdWtIdmVHTUJwMHQzVEpqZm0wRE9BN0RQQitlc01QVzJoeTA2bkVVUi84Z2JyeFRrdzdUanlZT0kwOEV0cGxKb1g0QURXdWxpRVAzNm5NK1lzbEJpbFZneDJsOVE2OWU5V1d1eHNNbzhYYUxnR1MxNy9hR0dvQUlqeEFLb2FwRnc4QTFhWnRvQnlNd1liRUhNekIxa0VrbXpkZklPb1hHT0RKSEVCYUQvR21MbkREUndaSGtha0lrcVRoWVZsc3d0TlpSYWNwQjhlbE5JWmJQMUZGNnd2K1lMK0NBenF4YVpBWWV1eWtpNUVob2hqek8yY2U4QWNHSU1INmxhN0RueTh2QTRaM3hWMThwbDNhdG9NUlY4V3NSVFE3ZWhNVkZ3YWdEMWd6d1BaWGFQcDNHQUNvWGNndzg1d0ZuN0h2dDNpZ3B3VEZRZmRjb2tDMDVya1lNQVA3RUdZbGRqMHpBbWpPWWovbEJYR01nQmc2bDdKb0NXUURnRnNLNlJaQlBPR0NNRjJxL2MxY0lDTStidE1adDJvWG1BTTkvTEliRE1vVm9PMXREMWpKTU9YUFlvQ25jZ0F5ZjRvbklrU1h2Tk8xbUpwdXFGK01rbHJYTGdGa1hCYkNncW9hRE5idUtYN0hFUktMNFYwcUlyOFRHSTBvS2JicWdLamprdmhhdmlSR0JsdTRReXcxdGl2UnJPUXhFZWIzSklBcGVoYTBEQTZZL1dveWk4dWdKR2IrbW90MDRsV3E4RXNrL1JJRFBGY0crRkFzWXhCaXpyYTFKZDNzSzBFdVJHM1lZazBzNG5WRnZoL2xVRnBMOG9lSFRCSlQ0T3dZRDJXaFFpUnJBSk1SQWYvZ1Eyc3RqVElDOHI1cWE2VWo4aUlRV0RLSjExOExBL2c0dWx1RXVDTzdNYTFVbEx1UEtPQXlZcHNBaDloZnhkd0dnL2pyRE1EVlQrU0VsUUxZb0pRd21lSUVZZzZya0wxb0p3T1FWclFZblVNVU5SYXhQTzFTSC9HQ01Xc2hSYTZsTVFtN2xSZVlHY2dGY2E4enF3OTZxME4zamVOSjFlSTVvSEM0MlJwL3l3WTBQdlhBNVhSS2xaVUNadzU3TWRhZnRpWHV5eUNaMWR2QlhBcjN1NERmWUlCbmNrQmw5OGRaeGgzSW9ickZvbWJ6MUMwTVdwdGRtaGIxNDlWaGpnRG0yeUlxSENWMVJZWTlKbmtBQnZTTkU4a1dYVUhvRzNOOUZ6RTZrazY5VmVKNnpaU0JBdUdycSsyM2NvSFZ6c3JLTHQ3NUsxMEtIM21ib3JoN0kvQWx0d2s5cDlOaGo3NUkwQzh5d1BNNHdEUUxGSHh1T1YyelI1NG54bHQ1SjVQaTJ5NUdTNEk2b0ZYYXhSV3hmTlVQanNWTWg2NURTd2VhTVJhbWd4RXdlaGdCbGN6K1hrMm9BWWtHaUYyY05vUllVdmJ1ZHdvQ1Rac1lXT09FUThGTGUySUJRcTlPN09qdmpFT1dYY0FianZ0R3lLL1M4NnNNOER3TzhCNW8wMUxQcFFIaW5Za3l0eEl4M3BQdDErYTNYREJZaVhna0pFZlNtdWhmckJqUUsxZDRnZ0dpY1Z6cFErYTJTaGdET2laaXcvb0wwcVZHVWtNSkVMV0xRZjJLRXhENnJOd2hBOVlPaGRrSEF2bEMyOUZNMmZJV2t4UElxMW4yeCtUTDVQdzdESUN3THRjK1c4dWpBbUtJeU1tZjZJRCtrMzJJakg5RVByeGVPY05QRXJOaFFOY3lra0xNQUNCNkZleEovanIyazQ5WjJ5MlFzWmg3T2dnMlpPUnlrSFlEeXZ5aHkwaFNrK002Nnloamd4d2NoZExJLzNNelU1Wlk5U1lwVnBlNUlITmU2L2tNOEVRT0FMSkVJSnM5WWg2SVJUcWttUUEwbnlQMDZCZ1dkcWtlZk01Tks0aHgxSUdMOUo4aWsxUTZ1WXU2a0p1QXNCclFSZ1NnMENJT2dMbCt1YnRjTnJMdEJVV1JhMXVmTHdGZy9XOXBDL21qWk5RYmZvM0szeFd0MW9FTkJiby90Uk1WR2tPc3QyTGNyMVB6Nnd6dzdIaVFXN203ai83U2hYUTFDWUVXdldsTmZtMUNHNldubHd4QWxpSGVHekk2ZS9vZ3czVlkxc3FqaVRLVEdFV2FGMWowUFBtQnBVRmxrM0dJMVo0K2FOd2FucDZmREI3MDM2eDczTXErdTBiR0s3Q3FUeEwvRzJ5TkZDaENYN25IaXI5QnpHOHd3SFBqUWFIbFZMbFpTeUs3YUVLSkpxNXhJTWFSc3lkWncwdlY0RlVHMUlSSmZUakxMQXRhSlUrUTJLWm04eDVCUVJ4dGIwcmg4V1E5ZEx4NTJJZ0RGVmZqdDhDb3Y3SkNsa0xtd1FEOGhaM285ZElQeWFhL0ZWQ0xtZUhzdmlLUDZCVXo0RHUwL0dzTUlBdldHNWxmWlA1V3N0MnM1em5rSE81R1dOZmhlRjRiNTlVQ1RkU0pRYlh1RkVBUDdNRUw5SVVyZlJCT3lTWG1XVks1N2tNcnJBS2tHc0E5R3hvQUFYQWwrSlRUdU51VG44T2VpelNyRnZSR0xwY1Z3Sm5yZzloYi9TMEdlRG9Ib0JkWWtkYXpGcm11R0txekdFUGpVU25iOE1jWWY0VXE1Rk9wUE5ISExjNnRtenNsKzBwZUhjbEtTLzQvazdTT0hkKy9SdjdTdVFHN05MQUVlR1lSQkJpYVI3Q09tNVcvOUtFR1FKQjBGKzczZG0vRzZKMExJSGZ0WUVMeUJLWnZrZkpiRFBCMER2Qm9kVjRCUGQzSS94VTN2eEZaVjFleVR1aVV5VmVBRXI0YUE4ZkFaMXRMRDU5dFhqTVowUTRkcU5Mdzh4YTVpL3pnVWNrcmN5b0ZpcFpzQnBOY1VzOTFBcEkrWm40WldPUGc5aVNwZFM3b2g5R0c2MWlPOTR4Q2Q0bDBmSStTMzJPQTUyc0J4ajNSRHVUMkNjNTR3WUNDREZoUmtNWWV5bE1BVVRjSEtWWk1NbDEzUmdBemdBcGs5eTJ1V0NrOGM2TmhZTjAyRXVYQm1OeGpFU1cwUEdFNlBqVU9hSm9lU3IrTEsyMlBlSnUrNi93T3lsNjVIdks0NEFnd1YzeVRrSCtUQVVqQ3k0UGI3TW1tYXd5RFFPU0xLNENuZ0kxU1JySVlkQ2Mzc1F5ZnVlbzVxbkczU2FUOUFhcHBVNWNBb2xkM1F5aklqZ0s4SHVxQ1c1SEFrYUhQZTJaSmVKZnVtL1dwM0VXSE5GcllOMG1Gc1pzOEkzUTk2aTFZUmVvT0tJQ0hNc0J6UFFIUzU2VGJHdG0zMmJ3Vk92OHc3QkFMNVk1VWNvWVpvYmg1WHowUUtvdFVrVUNud3RKRCtuY0VWc2Z4V2hTUGhFQ2NzTDF4VGJDeXVuZUVhZlNIOVlsdEZta2p0S3NqK21EVE0rR2hmRktiRHVMOHhXWDluNGt3aFhzSk1Bc0liK3BzME4zTUYxM0xkd1hBOXhuZ3VUS0E2RTFrcjBRWi93YVk0SXBpN1pKa21tOUVnSURPUW1rVzlYMGVrRC93SHl0R3VUUGNWeXhYODFNY3R3T1BBVlZlTTBLb0E3cFJ6RlozZEtuTXBaVUpsYVZGdklybkFjVDVYV1IvWWRQditqVnA0UWsyTXdLc3d5bFFta3FuZzhHZnpBQlA1WUNhTTFuNVpMRXBGNnJtK0YyTE9uSFh6QnNhaGtFblpIUm9nM0RFU1hhU2pkam5KdXBvQm03SzBBU284Q3NkRGJxOWNSakFWa3dMVDA3U2E4cTYyT0lZSHcwMklkRmprMzRXQTVEVVdtZVFha1hZNXp6cnpmR1FxTG81Uy9hTFZBUk8rVFpNeCs5VDhmc004Rnd0UUU5YU1UVjRTU2F0TU1zazJoVXMrUUExOHB5azRjWHJVZnpCTXR4eUNxM3FtVlFUQmloQUdvYlc1OGF3Q2hTeEppMWttSTJyQVE2dCtETElzYTljRUZaeStjTDRzeTh0TW15c25xcGM2Umx2UG1ZK0tuTGJ1cmRBY29RZ2NEWFU0RzNMbzd1V2I4di9QOHdBYjRJTGcvcE9zdnhYQUZVREo0bk9oSzNJNmcwRnYzWmt2MVhOYXZDVmtmTGRNVjZpaXUrNEFod0piaDFMaWxNQkVmNGxqaU1hUzFHQWFhWDhpcnlKcDNTR0k2bWpPcWFiM0Z4dnVDb3hrTnFSbDR3UnErczJKUWRmRnd4ZVhrYmNnRk1HOW1VTThGd09RS21lYVRabXBIY1VkL0hZR0JxZEFxQWh3WDV6akFZQnc1M3phSDBBUE14bUlMenYzRHl3UWd0ZGVTTENBeHg5K0pnTlVhV3VZUldqSVRLZzFNcHdKUVpGUWs5NXRBRGNuK243clk0OWYrTjkxREd2enBOUE01eGFRRmdwYTJVcSt5b1ppalNxd2p2M3JOOTFBSDdPQUUrV0FUNlc0RnhGUVhmckxWNHMreU83eitRemNRMmxib1hSbmgwMFFzK1VXcjg3SjdKTnpXY3BBbWNHY0FpM0o5Y3hiNkJQZEIvdkR2aGxPbE9aVEEwWG4xTVJUS3lvOUtKRmhiUDFaN2dxQlIzL2RLSjlhbVFpaUNvdzFTMGQ5VkhrV1J5aDRTNFMxdTlIQUI3QkFFL2pBTStUSDVDTVFiT1FnZFVlclI0ejExbjQ1UkxsVU5qZ09VMXVHZlI5WmVYYWZKeW1FcE00ZXo4c0JoNERNNXNDeWYrM3ZUMTRWSVNKdFVWT1FIbEtNMVFkMVdoNENsSm9vYm1lMytOem5rMTIzc3hhaDRhaXY5U3RRRzUrTWp1a1BCWitQNlBnenhqZ1NSeGdFa1Bpa1dVZnVWT0VKSHBQZkRQdEdjVXI2cDQ2SjhPSWg4bXNpUnZxdU5yZitqSTBnRWdCWFVOdkFuZmdKeXVSWXB0dFpKRFFSWFVlVUQwdzN5QituMklEVnR2cmZYR0RzWlRxMUN3Q2dQNXBieTJHblMxSVlvNU1BOVU5UVM1VUc4YS9NTUVQQ2ZoREJuZ1NCeVRZZmkxWGN0TXRldUFEZVVMT2tYY3VqYkdyRXF0ZmRUdy96eWtWd0VEMXVKb3FaUjNGQUx4TE5wZ09wQUMxWGpBRHFYamZyUGdCdktGYTUxUkQ0dWFRbFlzdm5sRU1BUDAvZXBCdENWSDNlOWFZWGs5MEgzTWV0bmVRN21yY0RjU3ZhOXpmc29zZy9KUitQMldBcDNCQUVDbTV4bVNkRENNTm1yWm9YWEpJYXRaT2svZWYrR1hKSi82SmxvNHhpTXRVeGpnd0VRVE8xRzRmSUlsRVI3dVFBYmp2dmdKd2tHOEp0UmRPc0FHU2pZL3ZDdzE1dGlIZzlsbWQ4eUJrOHZaTHFPR3NDTjQ3TzI2VndRdU5XNGNGOEdQNi8wMEd3QkFocHFOcTZJTnlYZ0F6MlRnTFRRM2xuVnJxdlZ3QnN3ZDUwZ3Q3YzBUN1BLQ2srazRobmlRS29yMUJyRVpuMTRrT1JtZWZHQ0p6RFpHeXJTaGsxekd4NXVGZVlFMlJlMThBdEpONkQ3aVR5bFNXQ1RycURJenJqUkVNUXlQeW5YUGxTSlIyMkdrRnZKNEJIczhCSm80S09aSjltT3ZXM2pnb1ppT1J1ZFYrek9uRURHdG9KYmJRTXFob21NdDZGb1RMWnBFRVlCaHJ1VmdiTnBXWTRRV2Q2WExSWENvS3RDME1SWmMvS0FuL1RwSUk1V3hrZEhCRmVremN2U1NUWFVhVHF0aDFWa3Rnc21BQ2tJSDJZNG1SMlJYaTA3REJBdjJjZWo5bmdJZHpRTENxbDJ2QW9ZZHpaS1FkTUVhcEZlV2FxU0syczNqSXFCbWJHcDgxUkpxbGt5d2tuSkZ4TXl0TEFKQkJJbkVhYzNiMWNNaHBzWW1wdVhmSTJWdXBJT1BQWnBGOHVtcWdteFpzWlpkbE9qbXUwazFTTW16RlUrMEFOeExUbXE2SkZuM0JjSnBUZVQyQWVEKy94Qk00Z0FkZ3VSWlR3Nnk0VlRHc20wTGtoN3dESEFSRjFCR2ZuU3VxQVkrZ2QxVjFTM2NKbGgwRE1LaUExcXpXVSthaUQ3SUVvNVVaSkJKbjYra2lycjd6TGtwVTdtUjUveDJrTEY5ckhJUmRXTm13aHZGYzg0a1pKYkdReGFOM3dFWkRmckVFRUd4amJsVWNtWTVIME80QjEzZzRCNFNNUGozQWV5dG5qTk1ZRjhTbHNSSDIyUnhYQnlnOU5oYzQxQzlRRUlQZ0pDMEcrUmM1T0ZVYTczbE9mY1lJUkdWbFVOU1dYKy9CQURRbUlReVFMdFB6UDF2TndZaEJOeGNiS3VUbnl0VWxhTWxzbkxWTkVjaFZFKzJyTThNeUl4bzhpNkhhUjlIL1FRendZQTdvT3BFTDVBS1hUVWJCQk9BcFNGa2FaSkFEMVZIM2pWSEJweEZjWnhxcTNZUXhrdXBKbXNFMEZ4UWd4WkRpcks2ZVMveHJjaEZ4eXBvbE4vU1JEOVg3VURqVkFKOXpCSHVxM0RjN2g3WkpoYjhoRVJoSDlkZU9HeFlCUmtLNXpHUG8veWdHZUNRSG1JQWlSOXRGZVdNSUVGTEtCdnVYYUxkVTRtRXZPZGdodXZHdnE2RjNna2llUjFVM0RqVXpnQy9vQU13b01DQ2xhMW55N3daSHJ6SnlDc1lGV2VvNG1na1M0UHJ1UXZuS05LVDlVelVwQU1ESHdKeE5YWTJZdEtVRjZlUEhsRFFCMEY1Rk02MDdCbUNFSXpvTmo2SC93eGpnZ1J4Z01FY3dwbDdYRGFNbjh6L0FCbE13MkN4UHE1Qk9icjBDRlJLdmpXYUlBTjR2Vy9lelJlaTNhSzhqVHdycXZZN0l6K0NmZnNwVzlObWEzcEFlY3psakFGKytoWk5xakFTcStYOWJVT1lleEpPb0hjOUdlSGZ6TzBCL2V6VWppeEZnQUYzeUlQby9qZ0VleUFIQnFZMEJORS80QTNLenNSMEtmbzFkYXFLT1QxbmJvN2lsOWhFUVhFUlJKUjIwTERKREtocjJFMWFvVUxRYmJaV1l3d0xBMlplUkZGeDNaSElNTjdHYXY3NU1tcVBQQVFLY1ZQVENTQ2J1TEJVcFZ1QUZIWkQxY3NFQTJCQzh4T1NIa2UxUkYvcUFBNzU2WWhEZW1XSlJjZnFES1pobUVyOUpuWnhMYm1jazVjQnhZcGF4YXpaR3dpY01uWWtVQ3lNRWNUK1FpYU1TVy9ZVXdnQ3p3d1NqbXd5dzJON1FHVndmMUJWa0dQcTk0N2l5SzErVnJiMzh0NnBsWjRUT1duZkRSUVBIMDkrNWdUT1VqNlBhdzY3ME9CbVFnRXl2QmxnYTZuK0xsSUhhUVRBcndaVFdYYjBPOWxZeFJWMkVCSm5ZMWZZcUQ1WUFpWnd3c2h1NHc4eGJFaHZSMmU1dVk4d095c044U0k3Tk5NWHpxUkNwdTJMZGIzb0ZuQUJjZTkreEt1U3lwdEh2bXJybnlUeXc1emgvVlFEZUYvSDIzVGlnZHhEdGNaZDZEQWVnd3A5SFlKZUUrZ3djWHM4Sk1GZE43TDRCU0xRQUZGYU1mdDBycFIwUHp1TjlUcjNsaGxORVlBQ0FUYnZWWmJBVGVabmNFUWhlMFJFQUs3U2xOUXNlQzN4UEpJT05LKzBBRDhXTmFkZER6dTk1cEpwSDdSODU4eW9SYVczbzA2MjV1bWxZcTd0V2RCUFM4Rkl1K1NBLzhQdy9tQUVld2dFQlV6eFFCT1FZdFVXaTk4WWl4MThHcWlzNWViTXFnZ0V6R1NHNUZ3SnhUQTB4UXpmbXpOSi84T2dkY0FpNUlNeUIrZ0RmUTlvVjgvaDZEaUdYUnI0R0dXaGNEY0NhWUVmSHFMOVhIOUIwcitnUk44TlU1QnZrU29BdG1wYnJIb3VpNmsyNVhTejN3UFAvYUFiNEVRZjA0d2F2Q0IxQVE5eWpzOXN3UEc2UTR5SUtQM1ZPNkNrLy9vNU9VT0llZ0k0VElwcWVnNm1GMitxeWs5YmdrbVNJSUNBSkpEdTMya3l5SURRR2wrS1pVclpkekdzcDloWnEzY2VQSmFBM296eUJsRk1FUm0zLzViNThmWmQ2Q25rOUpUNC82Mk1wOXRDci9WQUdNRVU0TGNOb3pldVkvNFhSdmdqNythQUhzVHZLWjk1MVRTRG41NkVzeENUSW8rMFNzZjFJNXh6d1VKa2haN2prMGdjVUYzUDh4YUlHblV5QXlQWEFBcmZSWExtd0FjM1hUVUxETGdkWG0vUStKR0t1aHRyVEFYR3dpMGFKQlNpdVFUdlVOQjhWd1lNSjl0akwvWVFERENaK2M2My9RbWEreE1mWGtkc2o3WTVpbVRSVFB0d1d2em83RktqVUJ6VjA5Y2owcUZYM2FtcnVGS0VqamE2d0FrZmYrRkJpNU9GUzJ1bllIZnVRc3VJNHZJVm9NREVmOE1Id3J1OVlnRDcyZHQ2ZWJ5SXRwZGVZdXJJM2VYZkt0MmtKRXRUc09CbVhEUEJvZWozNGV0L25BTk8wSWcrOFprMzBTa29rZ0pJaVhWUjEwNEYycHZUakRwTXZMek5YZ2pQT3Y4QkFFNHo4dzJ3d05KTmxpUXNEU041aElFSEx3RktYMGdGbDQwNm0xNlFWTnhYcVdHTkZHR0NEQ2ZlMWxsYStreGpnaVQ2cTJ5RW9jS2hFY3h1SHNSZjJBbURFZ0V6ZFFwb0g0YjgrZ2Y1UFlJRHZjSURCZUdkT3NSbUV3UTJETnNjSVUxQWxicUZEWHlpWmZ0Tm9Sb0JnaHNrMHFtdWt3amVpZEFSQWNacjdRRnprTmdvMEU4QXFVSllUZ281OGZDNjcyMGlLRVRHQ0xJMzV3V2dzYVhObWRBQWcvM2RHSW9LbjF6NVFlMkUwVTZCWDZBSDZleEFBYXJLYlZQMnVnK1l6UnNBYThmSFVldmdWanh4QUx0M0JjaUxhMWhaanduN1dOTUtxWkphbjFDcWovNkFTTkVXeXpaQ2Qxd0R3WDFrcG9FQmFOUW5pU1NlZkh2VmVDQS9UK2VVSUFhYnRrUk1CY2MvbGc1b2h0VmVVREtOWWxBeTVNZHg0ZjZEcHRUcG5TUnlYNEJHT0pvZGcvTmFIOEoyUUVMcS9JY2p0dUU5a3JlM2lKckJuM1hVbkR4ZkFvRTVJaHNDb0hRTjBjL2dKeEhyOEpmY2NnRnkzcWo2T21hSWxZdW9nbURrQkFWUDFqSHV6RnVlV2kzR1I2cFI4M2tqazhBWTQzMGhxWitBNURUUFBqaEpBYnZxelVhb3B3Q3loSUV6VTg4YmlKbWl0TS9BV3p3eDVnRkdRaUpFYXBHNkY2UnEzTUlDNVpKajc2SzkyQVVkWW83YVpxT2JNdlRjcFl1bHJCSUZMSDgrYVM5MEdJU3hLaE5NemFQV0VhKzQ0d0VlTWNMS280K0RUNzVhZWRWdEdUWDkvbmNkcFlld1BCbzFmWlJydXpJUVRSeFFVOXR2Q3NSN3BFRmhsY0FoT21HSlVTUEg4VnRjaXZNUTF4NTBWUmY4Q0kvQzB6RE5wZW5mbU9xUFFhWjFWc2JtbjY4aG9QQnZjOHRscWh5RHZ5Z0dOcW5mandJTGF1R1Bwa01TK3B6aHREU043Z09vUktEUWRuMEtxWjF6MGZXTUI5UFZqQmwva09mQnBHTU5NWTJVVllxNGQ5SDlkMlRmaXFFbTJ5L2JLYmtFVmJ1KzFjQVduN2NlUWtOeGtSUnVXZS9RNFFaNXo1WjNLMFUyamNjRXYxQW4wTTZuNHlJVkJXeGVBTWRyNmpCU3lRNytZK2s1V1NJcFhSWXBKVkxzaG43WFpFcVozcjNHa3dnb1VmSlhncG80Qk1Ga1JCaTNidHNoelBZbFF6N25zNElCaXBlc3FaM1JBQWV5V0ovYWlCMC9UQmxjL3NkQkNsakFiNlFXM1RmN2MyYis1OENHTlBrMjV5c0pmODBFakhhKzVGSng0Q3AxVVBEMFNSU09pTy9raWhYVHVkWlVmR1kyYWk4ejJjMW1ZQWNobGk5WnAxNzR4TFkwbFduZjk4UVhtT1NHV3VMVUJzK0taajlpYkVIbU1CWUtlOUR1TDlCVEQvNnl0UGNIODYzUjYwbldGQTNpa0Y5dnB2TU5TRWVFS2dqQWIrR2RQd0hmVHpISFZOQXdGSGxHdUJveEhMNUJjZFJVZzBXNDZnL3JvN2M1NmNUNnlRbkFjQUZndGl4R2dMUE1MbytJU2thdG1QelRxTFJ2UzRxQ2ZkdDVKTHVqcjdqK2dLamI3bnZ1V3lST3dxWkpUc01zdmRlUmZGZ0F5eTFJd2c0aGJpdTB3d1ZJYmxVTiswdmwvSmdPOHZ3V0c2MUJNQkhMVVV0UGEwY0UvS2Fndzh4OFRBTmZjZUk1b1FxY0VlZUJFMCtudm96dk9iNGt5ZHJCYzFJRDdLQU02UVJVazBsY25sWFVhRlhha0RFaU82dVhTQk1CQlhjakp1NHp4ZTNJRjg3YzZRdzM3OFdwRC9lMXBBQTMvVXUzS1RHRVA5ZEhscTlBL1NLVzRTdENiM0JLSlNESHNVdk8xR1FCZm90TFRydnorM2lLUkxyVWNVeXNKZ2ZZY3o0QXdESG1LV3hBTU1SZHlFMG4rdFV4ZXZNTjV6a21hT2xZb0I5QndteDh0WVFDU3RiUnRlaGxoWWp1VUNCKyt6Q2dyS3RGaDMyTStBWk1VYjJFTmY0VTZhNHUremdiZlEzOXlhZGF1bDFiclJnTWpqM3paVDRNM284dGJXOEY3bDR3VWtiNEJDVXRBanhxSE1veXB6eVBTTXhuZ0hlSWJ6NGZFSEEvbXRmRmFtd0xaVlEvVkhLSlk4a3BGYnpzOWRXOEhYM2lLeU1vbHdvQlBFZ1lRZ3dBVHYza1dySnloYVh2YjJOMElkanp0Mmswd3d6angvQ3AzT3FTM2FzZXR3VjloQVE0eE4xZEtkQkErM0YvQW1Xb2VYSVZBUi9jclRTMHB1czdDRnFFT1Voa3k4UlZQUzY1S2Z5RmNRb3ZJOUJOcDlGUUdlSC92UnU2S1VrN3lDRS9vejFPRGgyVGVBZWUxWHJjRHN5K01TQW81Y290VXhuczc1SDNQOXpDc1IwemRaaHhrWDJ3dkl1TDBBTXJHQ3FrWXgrZ2NLNVBsWE1VWGxZdTlqd0ZZZVhzRHVlVmtUSW1NbjdLMkYzUXF5OE9wakFTZ2pDK2Q5U1NXZ1E2SWhERW43TzdURWRFMmxzMGxYR3grTG9tZXpBRHYySStFUkU1NU81dis0K2tvRWdNVTJjYXRxcFBqWXEzeGlFemRzenFJcEhQd3pIRlpaQjVvQVJpbXBCRHZzeTBPczJ2R2Y5WmRKbllaS2FORk15ak02c0lnNGVXZEZiU2czUkg4TnlTZVd3UFNWRzlNVzNsMHVZUXJGWExNWk1oc2ZYNkJKejhNcTViOXUxcGdNWEIwck51emJkd09lekE2UEpkQXoyYUFkN2ozTlo5VzE5RlpzRXBLZWZDZEZQeDBndEVicXJNbEwzT3plblVZVkNmN1RDYVBsdytBZDU2Zm8wYWdjSGlRdTdyUG5tSlJ3QXpYS25FK3dBc1p6V2FINHU5cVEyRlFza3Q2czgrQ3R4bVlxNUZzejNYR3RSekpnRXlXQ3o3UU9iTDY5K08vaVZPQVNOS2hBYVQvU0N0eFZzbEc1YlFtQTUxTUcxbkttNzQyQSt6cjYra004RjUzRzN0NXpCWjIrRFNQOUdwU3FxdmtJRlZUQU9NUzh6NldobkFwWnY5Sm5yYUhXaGRyR1MyZ0Y5eHM2WlBPTzhmdkpTcU05a3RBaWVEREhWcVE4RCtNVmJKVWtiM3d3WldrRXhFNWVCSlNRQ0NNT1hOMmdrUTdFVTVyUFlNVm5MVzAzTjlmeVIvUkxQQ1BEMnhNUVlsVHpLa21LVVZiMTVtdUJrSms2ZkFsZG1zNllKVFE5V0hWdjdmVzh4bmdORDBvSGpiNUJpV0VKaXdTZ05JTXpLNUVGbElPUHFKcXA5WVVuZTExSFNpWkNUeGNKYkhVNWpacHBIdDZZbkE3OWN1SGE3ME1OTzNmeWh6cGtrVnBNbGhMYVVsZXpFS0VIWWNSRFcwVUlSL0FKK1JYVkc3NHFrZTMwaGRmRzRUTkNBK3RvdlBaQ29rODlWYyt1dTI5Qk1pOVh5RE84ei9pa2dOODZ4VVlvY1JjVGNpY0hVRkRhS2d4d1A5dm1aakE1cFlpSFRvcktKNHVhMkNIT282VURhTXhpU1dudVFoa0YzaS80b1oxOSt0bEtPSDlOOE1zbTRtN0xrN1dVV3cwK0dPdlQwakZSd1MwREtxSmJDNUQ0aHUzVFp0RXB0dHpsTWtqUk1rcGpzMUk1Y0JRRU50bnpYdGhpVG5Iei9QK2Q3VDVoYzlnRGhpNTlWb2oybCtNNE4ydG1QREkrVEVEaTArTjRnbTFwd3IrSTVIUUdtTi84UXVHMjlnRUpvWWNKejB0dnZWVUFveWZ6eERTU05JT0xoZ1ZTQ1BWTkRQeXE2QVN6YmR1NzJIdmc5dytERHdFeEVTQVRZaG44L0VLWFlnWVhVTjVTT3FDUDFsek90ejBmcFpqeFFGNWdGK1lBZjhUMHZ6R2g5RHlaRE41MytBZjI5NXhCVHhnZHBhV2htM0ljK1QzSVB2T3p4Y3dZRVlDWmtMUEF1cktBa0luZXpqMXR5VDhwTnk2SVlYdnFpL1hHYnNmUDlOUjVzalZwblp2bjNhOFpIcklkbThGc0tOQWZaQlJYNEFYMmFjV1FxQmpqaHhJWnlvR3FCSkxwZ2VOandYSDVBSCtDdmwvandIZWVRNGdGL3JITWZBSGs0STFxcjRTNG1Ld3pudTFCN3RVU3N4ckpXZkZjTStnN0Q0d0Z2TE0xRG8rUHZDdE4wU0lENmwvOGQyKy9MWkxnZjQxcVIxdXcvSml1VTB1bWRxQ3Y5TXgyZEdmS0QrTFpCU1Fjd2VEYnNxOTBMTHFXb1ZMRVpQWk9nTzVET1dRaTBBanlTL1I1ZGNZNEQzaW1MUlU0NllleVU4aVA1aUVxQW14b09vT3M1dkp1YXJJQk1nL21RekIyT2ZuMVZGYXFhU0RmeHBMWFdYZnhRQzczMjlTZlZlMUlWOFNXOFltbjRxYWxyM3B0M0hJd3RCU0pXL2p5ZnJvSDBROGZWWXVpUEovcXlsSlFRZS8zZG5OMVdOc0FJRFZ0ejM5U2RQOTB2bi9UUVo0ZnpkdnBDWlRITEZYUXdZK3VjNTBmQ0twUjdLblNKZkNqNmF2Nk1lWTVjeFpnUmdGU2QxZzJPY1luVXNlNFRTWWkxTlRjOGhTMStmOFk3NFFXVTduR0U0aEFPUWoxNEFsZEpyczZ6YVBieUtYSmZVc1JmL2NyWk9mTklEQUM1amFKcWdYdkVkeU5XZDBnREVMOE9NakZJbXB2M1g4MzMrWEFkNU5SVzNtbVArVzl2R2FQU1dXTHZydEZNNE5OalRQZ0pCdU1VNjBiTFdWSWFyNTVsNFZ0TGYzUGx5VGVJNGtkZ0FvRTdFZ3FvVmhsY1JtZHhlYW5pQy9QcEk1MjlzUHQ5ZXM4d2U2UXZHVGFTRDViRzVZaFhqYllrT0dCd1pDcGVoREQ5cFg1My8vYlAwcUE3eVRiOS9pZE9HV1VlMnpXZHhDRXQ1UTVUbzgxb0xBajVIY2tOVmpuMW4renJCSmRYcno1RlpCRHRCNzdmNFpDOWdSOXlVRG5zbGhVR0tvTjFEQy9zcCtSeFpOWkxZRFRPeXNodjRGQ2xWc2RsWVFDTmhNUlZXazM5ZVdva25keWZEU0MvcTczeVRKN3pMQSszc2JoU0RHRFhEZWRYUFJkcTc2aW9wdXlTWHhsTUE4WmNQT2NkZHh4dXNSWlIvWEFHRTRMbXVuN1g2bDdQZS8wSmdlMjZraXlOMXZQcXV6Vi9NZFdTQ0xxWUUydklzOFR6N1JtRDR3UGh6U0NtRm4rWUJKZjB5NVpaZFFIZFBPejB6OW5hemZab0FaRklvOTVydk1sTTNTSXdEeVkxVDFLWFJ6a2tXRkpMdXdodG9aN2VKTjVVRTdGRlJMb2JqU1loYXVMdHQ3Uk1ER1J6Njc4Y1ZGVjhZazhNb1QyMUZ1b3FmR1lSbmZIUUdXNlVxZ1BkbW4wUzRpUUhDUkRDR3RaUk1IQU5SRng4RnYwK09YUCsrOXM0Q2crNjZEeHBqYlJIYWd5eTZoTHgrdWR3bnNHSkRqNERzNjZycjB6Vi9YM2Rsa3ZLMGhCbEl2RGU5MnV6clhBZGNtNG9wd0pDQW9wQXFvU0wzbWtEV1hWd0ZVT1hDRzE1M2JLUEIxVXM4OHVJSnV6WkZJT2NrNGs1OW5lOWZBa2Y2L1Q0MWYvMFRoQUI4YVhEM3V1WUx2aDVIaG9MdE5HUDNKODlzNFZXTnBzM0c2ZXdRRmMwTXYzUFdGOFQyR0ZQQm85dDNSL1ZNSk1JM0F5bXpHQTRYakhybHpPVnAva0FEQWsyanVxUDVqSEFWSi9iTDh1dk9HRWxQeWlyby9CQjJQT2VjWEVPUDNQNUpXSWpVSzhuS0xIdnEzZEVmc0hpNzMzSGtHOWpOYzdya2dHOVN1S2NvL2dSb2ZabHphcG12ZVpRWHl5MGl0KzRKOG93RkUwWTIza2ZFWGE2aVlOVy9YSTR1b1lmLzNreDgvQUJPang2K0lBQ2pnbHU0WTRCV2tlQTBEdkF0RUY1TWE5bmNkQnB6Vmg3TUxFZG5lcERnYTFwZXZkdmZiQ3lLS3N1MG5iT2U2RFdQdGl1YmJGMGptZStjaVFQaFFrWHNOSVNpc3FVbFdSYjBsQnk4dUptRk10NjhCT1R2L3lUWXZvREU3U0JCaWhKZFE0a1VNOFA0K3pycDRoYUpSaDRYZi8yS3lNYnE3d09zN0wwUHpWbXV2Q1RTT2FPSkNMaFBTTm1wclhPM2NIaGlLbmdjMFlrQWRBR2h1U0lCMTk1WnVKUXh6ZytkUHhkVENaMlhrRlEwUWhSLy9FUDkvRVIxZXhnRHZhSGF5ZVpaa3BvenFmcFJkcEJaelRCa0JPUWRRRHNQRjhZdk80UzJKRzVEUDhKT0dyYVlrRzBOdkU5amRQUjhjR1d4djN5RStEOVNod01INXkxRGl4U2NoZ1hHODhHckxEWDEvdVVKbUthTjVUUFRyNmY5Q0JuaC81d0R2MkFDZkVQeHRvV0JzZTg0T1VMNU93OEN2dlZ2Q28wMUNhSHdpb25jeVh1bWVQQWpOcXNrYU45TEU0MFREZVZkTGZ1dGpCYTVldm5ZYkJWQUV6YzZVc1FTZTdtNGVOd0Z6cUNLWFM2Y1hhMzlacjJTQVk2VUlxcWxqNlFNU1ZPK3NzSFY0Z05tOEFTWm1PUnpvUy9KM2x4eUlvdDBHQzFIdmZyUDBVT0krbEREZmkvZGwzNVpSckRNdjJTMEk5dlRScHg1SFMwLzM5ZkxkcmFPbXBtQjhoUVRacDM5ZVNvSlhmdmlCQXlRL3l0WVREM2xWc2NHU050SmtxVW92a2p1MTZBNHlvR2NNa1pEbkpES1BBc0Z3TUJTU0FHVkk3V2g3RVJKd3FNVGM1M2Vta1NCTkNhdWFzYVhCVWw4Z1Ava1BLQXZMQUM4cGY0UCtyMmFBY3p3UmpBemlxUzBRQitKdlJlT3psR3VvczRxK1NjdFJGTVNuUGZiYVRCK1NZQXJUOFZXTFRWcXBQWEdIeUFjRGhLeVBFZWw1ZlZmYy9wWFNqK0RTcDBiZnRud0JKR0d4Ykd2OERmTC9BUVk0WllGcWV3K0o2WHBmQjhaVUZTZjc3T3gzcjJ6ZDFXN2hiYTM3WTRDV1laQ0NpbUhFb2NVREZ3M21JVVhqYTV3bGFRY0dVRUFjdWZCU3ZvWWJoN25YbkxKUUtrM3o3OVdiL3hjWTRJd0ZqREVETjRBVkFCRk5YMFp3UnpaR3NHRjZGR1ppaTNRbXNMMjFHME1ISUt5cjlHZWlpeXZ2aC9MMjJqUHR5WGtnODlOdXAxdzBqckltRFU2UkQ5dWdmdTRrUCs3RUE4Q1VReHQvZy94L2hBRSt3Sm5tTHRBMWVwbVV0VmZaSzFCbHVQVnFseUlXUGxCN051bnRIWXd5VmtVTXl3TDhnNTRCSGZwdHp0cHlIakJoT24xMG8xMEh2N1lEcGJLbklWMzdHbXE4YWIwQm1LeUl2M1A4My84S0E5eGtnY2JKUWN3RzNVZzFhYXRuQi9hZ3ZrUmsxcTNlYzVFcHNGZ292cjFxVUNLM3pBNEFBbTBiRi9Ha2p0ZkV2VHhTVllCK3hBNDN6eCt6bmVFN3VjQkxBVlBJU3MvK3lGZHZ1YXcvY2h2djV5ekFpRGtJbVBxcjZQdzZETDRMT2Q3ckFYcFJDYnVUMG5nQTAzSnhXeWY0ekNCV0hocUhDN21Jc3FDa0pveUlZVlRKMWtJMVFBL3VNMFhpbHhGRDZDSnZYQm11Yk9tZGlLL2U3ckgrekkyOFg3RUFXbjhBRXJLNHR6NzZmZDBkYkVrS0t5dXRWaU13SzJzTUcyQUdXS1dua0V1d2hBTk9DQlRJV1hRdVpnd1hTc29kejdVWWtqTGRjZjBPWUNBUGhBY0g2aUgrWDczVjIvcER0L0oreFFJSjdydk9udFh2dmhKa212bWtVSHRKYUorNUoxSi9reE9pT0xxNXpoeFEvV25RRnFPcUFUZFd3OW0wdUZxQjJTVW9nMThsdjVoL0NBTGwzdnIxNm0zZXJ6OTFNKzlIRnNEc0lLdXRmK3RnR2xzZHlERGFGeFdsZEE5aEE1a1FzUjRZWUJnR1NwcFJnQmNMbUpwWS9GVytqaUU3TUlkUXVXditDQ21oYk93NzB5TFJISVovaXN0L2oveC9qd0YyTEdBY2Q5alh0empDTnJzQVhXOGk0clpRaGVyY09KQzUxbjE3K0VDYlhBQXpCdzZJM1k1RHJjNkJ6aHgvVnBFMHltYmg5ZnY0QnRIM0Z4NStxT2lPVjIvdjVmcHpOL1ErV1FDUTZRQ1A5WHJaSC8xKy9tZXNIdUU3UjA3KzJ3WWFjVkVSMUd1STJSUTBZM2dIL1NTRjZjb1pkQjJDM2RicE5UeG1tVzR3TnFrS2ZmWFdYcTgvZUV2dllBRnVtWmJlV1hjc0FkejlFUUdmQTRKRTdGMFptYzE0RVN2czlCYkFoOTVmeXBYYktNanN4YnFPTFFVNytPUng5R2VyejBqUTZOWGJlcmIrNUUxaGNjczhxTnFXSVFCT0U0SHJrbmhxTEErRnhnaVdvd1RZczREVVgvb3hUbzVmS1g0aHp4VjIwQ1Rxa2NOQ1lRRHkzNFhVLzZzMzlNYjZxL2RGYTFGY29TZnpGdGRyMG5jRlFGSWk4cFNZOE1id1lVNWRNOEFRQXBnLzFlSFlSOWJRZWE1SVczVGtxZVNuTUZiZkpyLzhaVXA2NkppZmg2NC96QUR2NzJTT1NVUEl5TUh0MU1CWXJ0YVFtY0JaS3ZGcVhvNG8zYnQzU1JGV1R5djFCRkNVcGlPRzlFT005MXVEZ2M3cDM4R213N054Zm42eS9qUUQwR3B6dnU5NVFZOXFXZVVPR3gvRjRhb2RuZkZhQUtCd0x3eEloaEUrVmkyaXl3eDFBcllIRFVvcHM1WG5SeHlBdi83dTRlZjExeGtBQmNUcmVxTCtwVEhIWW9ab2J3SkVrUVc3ZGpXcFMrcDM4SUIxRlZUZWF0ZnhDNWlDTnBhNFpScWtzVU05YUhiOHE3ZnZzL1huYi9DZDBTYXZDdnpYNUdSQ3JOc1ZiMFF2bUxNbVhqVDJqVVlkVHVSQUN3UTduY2dGWUFNRklIT3p5bGR4WGVFalZNR3J0Kzd6OVEvY0l0WUpCNEJRN2ExczMvSEF0eXBoLzlTRndqNURNS0pDcU1ZRTJNRElKeUZicEJGelh2YWNwbjRZRC9EL0F2WGYveGtHb0hYSkFEeUZlemFLeUNFSGxHamx1dEkyQjI4ZmcwSk1XeUJ4YjJvQ1VNWkxWeVN6a0FRbFFQL2paMS9XUDNPaldBZVpqbkxNN3RPdk05N25RclVTOFN0Mks5NDVoaEVsSUdCa29ndFRYak9nd0o1UjFoRlkrTittL3ZzL3hnQWJDK0M4dXlwaG55RVFvQU8wQzlreUNrZHZKeG5XL3pENittdEp3ZmRCMDVORjFLNUpoUFhGdHhuZzFadjBwZlZ2M1MzV29IZ21iNDJIeU05V1R1NDJUOEYxMGdrQXo3NzBmL3RITVJZeDRzWXhqOXJDWmFRWWhadSt5UUN2M3A2dnJuL3Vobm10QUliVE1nd0dCWnhxRUhCbFNQa09SRmZHMU83cm1CQlhuU01BU0hJa2o4bWVtM0JoVHZnNkE3eDZXNzZ6L3NtYnh0S3F5M2VyNTdIbDlxNjFOQ2RkbDZqd1VCZFZZNXVXVHdMSHQ3Ylc2d2lrbnN6YXpqUDZFdXZ6ZjVENjcvOHdBN3lMWDNDQW1DS0JIaXlHUy9aSkFDYnBNYVZ3Y01CbTVTSHRWelg1L05ITytoSkdjOUtqUitSL24vcnYvellEWU9sZHJwZ0Vma0I3dnlQWjM2dDZrcDB2VUhQVXNIaDVqRHdROU5ibjB4TUVHQ2JCdnVHOURQRHFMZmpaK3Nkdm45Y200UjFQMmxNQTV1d1Y0SDZPanhVazRJMVpaRnByMmZXQkRuOVNjS1JQWjF6OGJ4RWY2My9nRVhodG5wdUpLcElTR0lWZDNSdGNoTEtqcVZ0b2JndUhBNkFQOUdTTUhqMWNQeDBhOStwSGZzejZIM2tNV2FLMmczV1lVYWxITWRhRzlnQ1BZVE1GRkVjTzN6Z05wSG1vc2JNamNMRDJHc0wvYWRyeitsOTZGbGxFOHF4aUV4My94dFcrNjZ3cFVUc1FJdENhRkQxUG9aUmtZYTV1QkE1dk1zQ3JIKy9SNjMvdWdXUUJacElodjk3ZXhrRFdVUU5tSjV3YjRyMWtOWVNKSnVsTWJicGpmNTh3d0tzZjZpbnJmL09weHBLcVg5TW1jdVNDR1hOMkdaRURXam13bWNBV29xcWh0QTRBdlM4T2ZQVmpQSFA5VHovY1hFbnBHZWRkZElwcTlCVXNDalByVUZRSzRLazFKV0MzejdLQlY5LzJiNnovQTFQUUw0SE1MSThXQUFBQUFFbEZUa1N1UW1DQwAPaW5pdGlhbFBvc2l0aW9uAAxpbml0aWFsVG91Y2gABWlucHV0AAZpbnRlbnQAB2lzQWxpdmUACWlzQ2hlY2tlZAALaXNDb2xsYXBzZWQADWlzSW50ZXJydXB0ZWQAAml0AAhraWxsTWVudQAPbGFtYmRhJEJ1dHRvbiQyABVsYW1iZGEkQnV0dG9uQWN0aW9uJDAAK2xhbWJkYSRCdXR0b25MaW5rJDEyJGNvbS1raW5vY3JwLWZtZW51LU1lbnUAK2xhbWJkYSRCdXR0b25Pbk9mZiQxJGNvbS1raW5vY3JwLWZtZW51LU1lbnUAEmxhbWJkYSRDaGVja0JveCQxMwARbGFtYmRhJENvbGxhcHNlJDQAJWxhbWJkYSRJbml0JDE0JGNvbS1raW5vY3JwLWZtZW51LU1lbnUAJWxhbWJkYSRJbml0JDE1JGNvbS1raW5vY3JwLWZtZW51LU1lbnUADmxhbWJkYSRJbml0JDE2ACVsYW1iZGEkSW5pdCQxNyRjb20ta2lub2NycC1mbWVudS1NZW51ACVsYW1iZGEkSW5pdCQxOCRjb20ta2lub2NycC1mbWVudS1NZW51AA5sYW1iZGEkSW5pdCQxOQAlbGFtYmRhJEluaXQkMjAkY29tLWtpbm9jcnAtZm1lbnUtTWVudQAlbGFtYmRhJEluaXQkMjEkY29tLWtpbm9jcnAtZm1lbnUtTWVudQAobGFtYmRhJElucHV0TnVtJDUkY29tLWtpbm9jcnAtZm1lbnUtTWVudQARbGFtYmRhJElucHV0TnVtJDYAKGxhbWJkYSRJbnB1dE51bSQ3JGNvbS1raW5vY3JwLWZtZW51LU1lbnUAKmxhbWJkYSRJbnB1dFRleHQkMTAkY29tLWtpbm9jcnAtZm1lbnUtTWVudQApbGFtYmRhJElucHV0VGV4dCQ4JGNvbS1raW5vY3JwLWZtZW51LU1lbnUAEmxhbWJkYSRJbnB1dFRleHQkOQAsbGFtYmRhJFJhZGlvQnV0dG9uJDExJGNvbS1raW5vY3JwLWZtZW51LU1lbnUAD2xhbWJkYSRTd2l0Y2gkMwAwbGFtYmRhJFRlc3RNZW51JDAkY29tLWtpbm9jcnAtZm1lbnUtTWFpbkFjdGl2aXR5ADFsYW1iZGEkb25Ub3VjaGVMaXN0ZW5lciQyMiRjb20ta2lub2NycC1mbWVudS1NZW51AAxsYXVuY2hlckljb24AFmxhdW5jaGVySWNvbkRlY29kZWRJbWcAGGxhdW5jaGVySWNvbkxheW91dFBhcmFtcwAQbGF1bmNoZXJJY29uU2l6ZQAMbGF5b3V0UGFyYW1zAAlsaW5lV2lkdGgADGxpbmVhckxheW91dAAIbG9hZERhdGEACm1Db2xsYXBzZWQACW1FeHBhbmRlZAAMbUZpbGxlZFBhaW50AAdtRm9vdGVyAAdtSGVhZGVyAAxtU3Ryb2tlUGFpbnQACm1UZXh0UGFpbnQAB21UaHJlYWQACG1ha2VUZXh0AANtYXgABG1lbnUAA21pbgAEbmFtZQAHbmV3VGV4dAACb2YAEG9uQ2hlY2tlZENoYW5nZWQAB29uQ2xpY2sACG9uQ3JlYXRlAAZvbkRyYXcAC29uTG9uZ0NsaWNrABFvblByb2dyZXNzQ2hhbmdlZAAUb25TdGFydFRyYWNraW5nVG91Y2gAE29uU3RvcFRyYWNraW5nVG91Y2gAB29uVG91Y2gAEG9uVG91Y2hlTGlzdGVuZXIAB29wdGlvbnMABnBhcmFtcwAFcGFyc2UACnBhcnNlQ29sb3IACHBhcnNlSW50AARwb3NYAARwb3NZAAhwb3NpdGlvbgAOcG9zdEludmFsaWRhdGUAAXIAC3JhZGlvQnV0dG9uAApyYWRpb0dyb3VwAAZyYWRpdXMABHJhd1gABHJhd1kADnJlbW92ZUFsbFZpZXdzAApyZW1vdmVWaWV3AA5yZXF1aXJlTm9uTnVsbAADcmdiABFyb3VuZGVkQmFja2dyb3VuZAADcnVuABJzYXZlZEluc3RhbmNlU3RhdGUACnNjcm9sbFZpZXcAFnNjcm9sbFZpZXdMYXlvdXRQYXJhbXMAB3NlZWtCYXIAA3NldAAKc2V0QWxsQ2FwcwAIc2V0QWxwaGEADHNldEFudGlBbGlhcwANc2V0QmFja2dyb3VuZAASc2V0QmFja2dyb3VuZENvbG9yABFzZXRCdXR0b25UaW50TGlzdAAKc2V0Q2hlY2tlZAAIc2V0Q29sb3IADnNldENvbG9yRmlsdGVyAA9zZXRDb3JuZXJSYWRpdXMAEnNldERhdGFiYXNlRW5hYmxlZAAMc2V0RWxsaXBzaXplAAZzZXRGUFMAF3NldEZvY3VzYWJsZUluVG91Y2hNb2RlAApzZXRHcmF2aXR5ABFzZXRIaWdobGlnaHRDb2xvcgAQc2V0SGludFRleHRDb2xvcgAOc2V0SW1hZ2VCaXRtYXAADHNldElucHV0VHlwZQAPc2V0TGF5b3V0UGFyYW1zAApzZXRNYXJnaW5zABVzZXRNYXJxdWVlUmVwZWF0TGltaXQABnNldE1heAAKc2V0TWVzc2FnZQAGc2V0TWluABFzZXROZWdhdGl2ZUJ1dHRvbgAac2V0T25DaGVja2VkQ2hhbmdlTGlzdGVuZXIAEnNldE9uQ2xpY2tMaXN0ZW5lcgAWc2V0T25Mb25nQ2xpY2tMaXN0ZW5lcgAac2V0T25TZWVrQmFyQ2hhbmdlTGlzdGVuZXIAEnNldE9uVG91Y2hMaXN0ZW5lcgAOc2V0T3JpZW50YXRpb24ACnNldFBhZGRpbmcAEXNldFBvc2l0aXZlQnV0dG9uAAtzZXRQcm9ncmVzcwAMc2V0U2NhbGVUeXBlAAtzZXRTZWxlY3RlZAANc2V0U2luZ2xlTGluZQAOc2V0U3Ryb2tlV2lkdGgACHNldFN0eWxlAAdzZXRUZXh0AAxzZXRUZXh0QWxpZ24ADHNldFRleHRDb2xvcgALc2V0VGV4dFNpemUAEXNldFRocmVhZFByaW9yaXR5ABBzZXRUaHVtYlJlc291cmNlAAdzZXRUaW1lAAtzZXRUaW50TGlzdAAIc2V0VGl0bGUAEHNldFRyYWNrUmVzb3VyY2UAC3NldFR5cGVmYWNlABJzZXRWZXJ0aWNhbEdyYXZpdHkAB3NldFZpZXcADXNldFZpc2liaWxpdHkABHNob3cABHNpemUABXNsZWVwAAlzbGVlcFRpbWUABXN0YXJ0AA1zdGFydEFjdGl2aXR5AA1zdGFydENvbGxhcHNlAARzdGVwAAZzdHJva2UACHN1YnRpdGxlAApzd2l0Y2hWaWV3AAJ0MQACdGQABHRleHQACXRleHQvaHRtbAAIdGV4dFZpZXcABnRoaXMkMAAEdGltZQAFdGl0bGUAEXRpdGxlTGF5b3V0UGFyYW1zAAh0b1N0cmluZwADdG9YAAN0b1kACXRvcE1hcmdpbgADdHh0ABB1cGRhdGVWaWV3TGF5b3V0AAN1cmwAA3ZhbAAMdmFsJGZlYXROYW1lAAd2YWwkbWluAAh2YWwkc3RlcAAMdmFsJHRleHRWaWV3AAl2YWwkdmFsdWUABXZhbHVlAAd2YWx1ZU9mAAR2aWV3AAd3ZWJWaWV3AAV3aGljaAAFd2lkdGgABndpbmRvdwANd2luZG93TWFuYWdlcgAId21QYXJhbXMAAXgAAngwAAF5ALcPfn5+eyJMY29tL2tpbm9jcnAvZm1lbnUvQ29uZmlnOyI6ImNjM2FhZTNmIiwiTGNvbS9raW5vY3JwL2ZtZW51L0VTUFZpZXc7IjoiMzZkMGE1OGQiLCJMY29tL2tpbm9jcnAvZm1lbnUvTWFpbkFjdGl2aXR5JCRFeHRlcm5hbFN5bnRoZXRpY0xhbWJkYTA7IjoiLTJlODQ5OTIwOSIsIkxjb20va2lub2NycC9mbWVudS9NYWluQWN0aXZpdHk7IjoiODk2M2ExNDciLCJMY29tL2tpbm9jcnAvZm1lbnUvTWVudSQkRXh0ZXJuYWxTeW50aGV0aWNMYW1iZGEwOyI6Ii0yNGY0MzBjNDEiLCJMY29tL2tpbm9jcnAvZm1lbnUvTWVudSQkRXh0ZXJuYWxTeW50aGV0aWNMYW1iZGExMDsiOiI0M2FiYWJjMjEiLCJMY29tL2tpbm9jcnAvZm1lbnUvTWVudSQkRXh0ZXJuYWxTeW50aGV0aWNMYW1iZGExMTsiOiItMWFlZGFhNGEwIiwiTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhMTI7IjoiODI0YjI0NWEwIiwiTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhMTM7IjoiNDNhYmVlZGJmIiwiTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhMTQ7IjoiNmI3MWI4ZTVlIiwiTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhMTU7IjoiNWIwODlmNjFhIiwiTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhMTY7IjoiMjg5ODFjY2IyIiwiTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhMTc7IjoiOTQ4YWI2ZDM4IiwiTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhMTg7IjoiMzZiOWE2M2YyIiwiTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhMTk7IjoiOThlZmVjMTNiIiwiTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhMTsiOiI3YWYwOTQiLCJMY29tL2tpbm9jcnAvZm1lbnUvTWVudSQkRXh0ZXJuYWxTeW50aGV0aWNMYW1iZGEyMDsiOiItNDgxZTExNTRlIiwiTGNvbS9raW5vY3JwL2ZtZW51L01lbnUkJEV4dGVybmFsU3ludGhldGljTGFtYmRhMjE7IjoiLTQ4NjNjNTNkZSIsIkxjb20va2lub2NycC9mbWVudS9NZW51JCRFeHRlcm5hbFN5bnRoZXRpY0xhbWJkYTIyOyI6Ii04ZjFiZGRjOTUiLCJMY29tL2tpbm9jcnAvZm1lbnUvTWVudSQkRXh0ZXJuYWxTeW50aGV0aWNMYW1iZGEyOyI6Ii00Y2E0MTAzNjgiLCJMY29tL2tpbm9jcnAvZm1lbnUvTWVudSQkRXh0ZXJuYWxTeW50aGV0aWNMYW1iZGEzOyI6Ii03OWNkZTdmZiIsIkxjb20va2lub2NycC9mbWVudS9NZW51JCRFeHRlcm5hbFN5bnRoZXRpY0xhbWJkYTQ7IjoiLTYyYWZhOGM3OCIsIkxjb20va2lub2NycC9mbWVudS9NZW51JCRFeHRlcm5hbFN5bnRoZXRpY0xhbWJkYTU7IjoiLTc0YzMzODlhYiIsIkxjb20va2lub2NycC9mbWVudS9NZW51JCRFeHRlcm5h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";
  const Base64 = Java.use("android.util.Base64");
  const StringClass = Java.use("java.lang.String");
  const InMemoryDexClassLoader = Java.use("dalvik.system.InMemoryDexClassLoader");
  const ByteBuffer = Java.use("java.nio.ByteBuffer");
  const dexJavaString = StringClass.$new(dexBase64);
  const dexBytesJava = Base64.decode(dexJavaString, 0);
  const byteBuffer = ByteBuffer.wrap(dexBytesJava);
  const loader = InMemoryDexClassLoader.$new(byteBuffer, Java.classFactory.loader);
  Java.classFactory.loader = loader;
  main().catch((e) => console.error(e));
});
async function main() {
  const MainActivity = await getActivity(APP_MAIN_ACTIVITY);
  const Menu = Java.use("com.kinocrp.fmenu.Menu");
  const PInteger = Java.use("com.kinocrp.fmenu.PInteger");
  const PBoolean = Java.use("com.kinocrp.fmenu.PBoolean");
  const PString = Java.use("com.kinocrp.fmenu.PString");
  const ESPView = Java.use("com.kinocrp.fmenu.ESPView");
  const menu = Menu.$new(MainActivity);
  const espView = ESPView.$new(MainActivity);
  const rootView = Java.cast(MainActivity.getWindow().getDecorView().getRootView(), Java.use("android.view.ViewGroup"));
  ESPView.onDraw.implementation = function(canvas) {
    this.onDraw(canvas);
    const width = this.getWidth();
    const height = this.getHeight();
    this.DrawFilledCircle(canvas, 255, 0, 0, 0, width / 2 - 100, height, 27);
    this.DrawFilledCircle(canvas, 255, 0, 0, 0, width / 2 + 100, height, 27);
    this.DrawLine(canvas, 255, 0, 0, 0, 30, width / 2 - 100, height - 12, width / 2 + 100, height - 12);
    this.DrawText(canvas, 255, 255, 255, 255, "Powered By Frida", width / 2, height - 5, 17);
  };
  Java.scheduleOnMainThread(() => {
    menu.attach();
    rootView.addView(espView);
    espView.setFPS(ESP_REFRESH_RATE);
  });
}
