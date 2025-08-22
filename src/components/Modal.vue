<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="modal-overlay z-10"
      @click="handleOverlayClick"
      @keydown.esc="closeModal"
      tabindex="0"
      ref="modalRef"
    >
      <Transition name="modal" appear>
        <div
          class="modal-container"
          :class="[sizeClass, customClass]"
          @click.stop
          role="dialog"
          :aria-labelledby="titleId"
          aria-modal="true"
        >
          <!-- Header -->
          <div v-if="showHeader" class="modal-header">
            <h2 v-if="title" :id="titleId" class="modal-title">
              {{ title }}
            </h2>
            <slot name="header" v-else></slot>
            <button
              v-if="closable"
              @click="closeModal"
              class="modal-close-btn"
              aria-label="ปิด Modal"
              type="button"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer || showDefaultFooter" class="modal-footer">
            <slot name="footer">
              <div v-if="showDefaultFooter" class="default-footer">
                <button @click="closeModal" class="btn btn-secondary" type="button">
                  {{ cancelText }}
                </button>
                <button
                  @click="confirmModal"
                  class="btn btn-primary"
                  type="button"
                  :disabled="confirmDisabled"
                >
                  {{ confirmText }}
                </button>
              </div>
            </slot>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
let openModalCount = 0
// Props
interface Props {
  modelValue?: boolean
  title?: string
  size?: 'small' | 'medium' | 'large' | 'full'
  closable?: boolean
  closeOnOverlay?: boolean
  showHeader?: boolean
  showDefaultFooter?: boolean
  confirmText?: string
  cancelText?: string
  confirmDisabled?: boolean
  customClass?: string
  persistent?: boolean
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  size: 'medium',
  closable: true,
  closeOnOverlay: true,
  showHeader: true,
  showDefaultFooter: false,
  confirmText: 'ตกลง',
  cancelText: 'ยกเลิก',
  confirmDisabled: false,
  customClass: '',
  persistent: false,
  zIndex: 1000,
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  confirm: []
  open: []
}>()

// Refs
const modalRef = ref<HTMLElement>()
const titleId = ref(`modal-title-${Math.random().toString(36).substr(2, 9)}`)

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const sizeClass = computed(() => {
  const sizeClasses = {
    small: 'modal-small',
    medium: 'modal-medium',
    large: 'modal-large',
    full: 'modal-full',
  }
  return sizeClasses[props.size]
})

// Methods
const closeModal = () => {
  if (!props.persistent) {
    isOpen.value = false
    emit('close')
  }
}

const confirmModal = () => {
  if (!props.confirmDisabled) {
    emit('confirm')
  }
}

const handleOverlayClick = () => {
  console.log('close')
  if (props.closeOnOverlay) {
    closeModal()
  }
}

// Body scroll management
const originalBodyStyle = ref('')

const disableBodyScroll = () => {
  if (openModalCount === 0) {
    document.body.style.overflow = 'hidden'
  }
  openModalCount++
}

const enableBodyScroll = () => {
  openModalCount--
  if (openModalCount <= 0) {
    document.body.style.overflow = ''
    openModalCount = 0
  }
}

// Focus management
const focusModal = async () => {
  await nextTick()
  if (modalRef.value) {
    modalRef.value.focus()
  }
}

// Watchers
watch(isOpen, (newValue) => {
  if (newValue) {
    disableBodyScroll()
    focusModal()
    emit('open')
  } else {
    enableBodyScroll()
  }
})

// Lifecycle
onMounted(() => {
  if (isOpen.value) {
    disableBodyScroll()
    focusModal()
  }
})

onUnmounted(() => {
  enableBodyScroll()
})

// Expose methods for parent component
defineExpose({
  close: closeModal,
  open: () => {
    isOpen.value = true
  },
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  /* z-index: v-bind(zIndex); */
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  margin: 20px;
}

/* Sizes */
.modal-small {
  width: 100%;
  max-width: 400px;
}

.modal-medium {
  width: 100%;
  max-width: 600px;
}

.modal-large {
  width: 100%;
  max-width: 900px;
}

.modal-full {
  width: 95vw;
  height: 95vh;
  max-width: none;
  max-height: none;
}

/* Header */
.modal-header {
  padding: 24px 24px 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
  margin-bottom: 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-close-btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Body */
.modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

/* Footer */
.modal-footer {
  padding: 16px 24px 24px 24px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.default-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  font-size: 0.875rem;
}

.btn:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px #3b82f6;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: all 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(-20px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    margin: 10px;
    border-radius: 8px;
  }

  .modal-full {
    width: 100vw;
    height: 100vh;
    margin: 0;
    border-radius: 0;
  }

  .modal-header {
    padding: 20px 20px 0 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 12px 20px 20px 20px;
  }

  .default-footer {
    flex-direction: column-reverse;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .modal-container {
    background: #1f2937;
    color: #f9fafb;
  }

  .modal-header {
    border-bottom-color: #374151;
  }

  .modal-title {
    color: #f9fafb;
  }

  .modal-close-btn {
    color: #9ca3af;
  }

  .modal-close-btn:hover {
    background-color: #374151;
    color: #f3f4f6;
  }

  .modal-footer {
    background-color: #111827;
    border-top-color: #374151;
  }

  .btn-secondary {
    background-color: #374151;
    color: #f9fafb;
    border-color: #4b5563;
  }

  .btn-secondary:hover {
    background-color: #4b5563;
    border-color: #6b7280;
  }
}
</style>
