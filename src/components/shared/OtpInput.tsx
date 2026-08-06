import { useEffect, useState, useRef } from 'react'
import Input from '@/components/ui/Input'
import classNames from '@/utils/classNames'
import type { ChangeEvent, KeyboardEvent, ClipboardEvent } from 'react'

interface OTPInputProps {
    length?: number
    value?: string
    onChange?: (value: string) => void
    disabled?: boolean
    className?: string
    inputClass?: string
    autoFocus?: boolean
    placeholder?: string
    invalid?: boolean
    shake?: boolean
}

const OTPInput = ({
    length = 6,
    value = '',
    onChange,
    disabled = false,
    className = '',
    inputClass,
    autoFocus = false,
    placeholder,
    invalid = false,
    shake = false,
}: OTPInputProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, setActiveInput] = useState<number>(0)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        inputRefs.current = Array(length)
            .fill(null)
            .map((_, i) => inputRefs.current[i] || null)
    }, [length])

    useEffect(() => {
        if (!value || value.length === 0) {
            inputRefs.current[0]?.focus()
        }
    }, [value])

    const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const newValue = e.target.value
        if (newValue.length > 1) return

        // Restrict to numeric digits only
        if (newValue && !/^[0-9]$/.test(newValue)) {
            return
        }

        const newOTPValue =
            value.slice(0, index) + newValue + value.slice(index + 1)

        onChange?.(newOTPValue)

        if (newValue && index < length - 1) {
            setActiveInput(index + 1)
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (
        e: KeyboardEvent<HTMLInputElement>,
        index: number,
    ) => {
        if (e.key === 'Backspace') {
            e.preventDefault()
            if (value[index]) {
                const newOTPValue =
                    value.slice(0, index) + '' + value.slice(index + 1)
                onChange?.(newOTPValue)
            } else if (index > 0) {
                setActiveInput(index - 1)
                inputRefs.current[index - 1]?.focus()
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            e.preventDefault()
            setActiveInput(index - 1)
            inputRefs.current[index - 1]?.focus()
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            e.preventDefault()
            setActiveInput(index + 1)
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pastedData = e.clipboardData
            .getData('text/plain')
            .replace(/[^0-9]/g, '')
            .slice(0, length)
        if (pastedData) {
            onChange?.(pastedData.padEnd(length, ''))
            const nextIndex = Math.min(pastedData.length, length - 1)
            inputRefs.current[nextIndex]?.focus()
        }
    }

    const setRef = (index: number) => (ref: HTMLInputElement | null) => {
        inputRefs.current[index] = ref
    }

    return (
        <div
            className={classNames(
                'flex gap-2 transition-transform duration-200',
                shake && 'animate-[shake_0.4s_ease-in-out]',
                className,
            )}
            style={
                shake
                    ? {
                          animation: 'shake 0.4s ease-in-out',
                      }
                    : undefined
            }
        >
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-6px); }
                    40%, 80% { transform: translateX(6px); }
                }
            `}</style>
            {Array(length)
                .fill(null)
                .map((_, index) => (
                    <Input
                        key={index}
                        ref={setRef(index)}
                        className={classNames(
                            'text-center text-lg h-[58px] w-[58px]',
                            inputClass,
                        )}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={value[index] || ''}
                        disabled={disabled}
                        autoFocus={autoFocus && index === 0}
                        placeholder={placeholder}
                        aria-label={`Digit ${index + 1} of ${length}`}
                        invalid={invalid}
                        onChange={(e) =>
                            handleChange(
                                e as ChangeEvent<HTMLInputElement>,
                                index,
                            )
                        }
                        onKeyDown={(e) =>
                            handleKeyDown(
                                e as KeyboardEvent<HTMLInputElement>,
                                index,
                            )
                        }
                        onPaste={handlePaste}
                        onFocus={() => setActiveInput(index)}
                    />
                ))}
        </div>
    )
}

export default OTPInput
