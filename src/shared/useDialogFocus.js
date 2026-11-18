import { nextTick, onBeforeUnmount, watch } from 'vue'

// Keep keyboard interaction inside the visible dialog and return to its trigger.
export function useDialogFocus(isOpen, dialog, close) {
  let previousFocus
  let previousOverflow = ''
  let listening = false
  const onKeydown = (event) => {
    if (!isOpen.value) return
    if (event.key === 'Escape') { event.preventDefault(); close(); return }
    if (event.key !== 'Tab') return
    const items = [...(dialog.value?.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]') || [])]
      .filter(el => el.getClientRects().length && !el.disabled)
    const first = items[0], last = items.at(-1)
    if (!first) { event.preventDefault(); return }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  const release = () => {
    if (!listening) return
    document.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = previousOverflow
    previousFocus?.focus()
    listening = false
  }
  watch(isOpen, async (open) => {
    if (!open) { release(); return }
    previousFocus = document.activeElement
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeydown)
    listening = true
    await nextTick()
    if (isOpen.value) dialog.value?.querySelector('button, input, select, textarea, a[href]')?.focus()
  })
  onBeforeUnmount(release)
}
