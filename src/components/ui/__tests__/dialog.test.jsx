import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Dialog, DialogContent, DialogDescription } from '../dialog'

describe('DialogContent accessibility', () => {
  it('adds aria-describedby when description prop is provided', () => {
    render(
      <Dialog open>
        <DialogContent description="Descrição acessível para o conteúdo do diálogo">
          <div>Conteúdo</div>
        </DialogContent>
      </Dialog>
    )

    const content = screen.getByRole('dialog')
    const describedById = content.getAttribute('aria-describedby')
    expect(describedById).toBeTruthy()
    const descEl = document.getElementById(describedById)
    expect(descEl).toBeTruthy()
    expect(descEl).toHaveTextContent('Descrição acessível')
  })

  it('keeps Radix linkage when DialogDescription is used as child', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogDescription>Descrição via componente</DialogDescription>
        </DialogContent>
      </Dialog>
    )

    const content = screen.getByRole('dialog')
    const describedById = content.getAttribute('aria-describedby')
    expect(describedById).toBeTruthy()
    const descEl = document.getElementById(describedById)
    expect(descEl).toBeTruthy()
    expect(descEl).toHaveTextContent('Descrição via componente')
  })
})