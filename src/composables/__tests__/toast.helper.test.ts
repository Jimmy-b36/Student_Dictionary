import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useToastHelper } from '../toast.helper'

const mockAdd = vi.fn()

vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn(() => ({
    add: mockAdd
  }))
}))

describe('useToastHelper', () => {
  let toastHelper: ReturnType<typeof useToastHelper>

  beforeEach(() => {
    vi.clearAllMocks()
    toastHelper = useToastHelper()
  })

  describe('success', () => {
    it('should call toast.add with success severity and default values', () => {
      toastHelper.success('Operation completed')

      expect(mockAdd).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Operation completed',
        life: 3000
      })
    })

    it('should allow custom summary', () => {
      toastHelper.success('Word added to dictionary', 'Word Added')

      expect(mockAdd).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Word Added',
        detail: 'Word added to dictionary',
        life: 3000
      })
    })

    it('should allow custom life duration', () => {
      toastHelper.success('Quick message', 'Success', 1000)

      expect(mockAdd).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Quick message',
        life: 1000
      })
    })
  })

  describe('error', () => {
    it('should call toast.add with error severity and default values', () => {
      toastHelper.error('Something went wrong')

      expect(mockAdd).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong',
        life: 3000
      })
    })

    it('should allow custom summary', () => {
      toastHelper.error('You do not have permission', 'Access Denied')

      expect(mockAdd).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Access Denied',
        detail: 'You do not have permission',
        life: 3000
      })
    })

    it('should allow custom life duration', () => {
      toastHelper.error('Critical error', 'Error', 10000)

      expect(mockAdd).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Critical error',
        life: 10000
      })
    })
  })

  describe('warn', () => {
    it('should call toast.add with warn severity and default values', () => {
      toastHelper.warn('This action cannot be undone')

      expect(mockAdd).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Warning',
        detail: 'This action cannot be undone',
        life: 3000
      })
    })

    it('should allow custom summary', () => {
      toastHelper.warn('File size exceeds limit', 'Size Warning')

      expect(mockAdd).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Size Warning',
        detail: 'File size exceeds limit',
        life: 3000
      })
    })
  })

  describe('info', () => {
    it('should call toast.add with info severity and default values', () => {
      toastHelper.info('New features available')

      expect(mockAdd).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Info',
        detail: 'New features available',
        life: 3000
      })
    })

    it('should allow custom summary', () => {
      toastHelper.info('Click here to learn more', 'Tip')

      expect(mockAdd).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Tip',
        detail: 'Click here to learn more',
        life: 3000
      })
    })
  })

  describe('toast instance', () => {
    it('should expose the original toast instance for advanced use cases', () => {
      expect(toastHelper.toast).toBeDefined()
      expect(toastHelper.toast.add).toBe(mockAdd)
    })

    it('should allow direct access to toast.add for custom options', () => {
      toastHelper.toast.add({
        severity: 'success',
        summary: 'Custom',
        detail: 'With custom properties',
        life: 5000,
        closable: false
      })

      expect(mockAdd).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Custom',
        detail: 'With custom properties',
        life: 5000,
        closable: false
      })
    })
  })

  describe('multiple calls', () => {
    it('should handle multiple toast calls', () => {
      toastHelper.success('First message')
      toastHelper.error('Second message')
      toastHelper.info('Third message')

      expect(mockAdd).toHaveBeenCalledTimes(3)
      expect(mockAdd).toHaveBeenNthCalledWith(1, expect.objectContaining({ severity: 'success' }))
      expect(mockAdd).toHaveBeenNthCalledWith(2, expect.objectContaining({ severity: 'error' }))
      expect(mockAdd).toHaveBeenNthCalledWith(3, expect.objectContaining({ severity: 'info' }))
    })
  })
})
