import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from '@factor_ec/ui';

import { ContactCreate } from './contact-create';

describe('ContactCreate', () => {
  let component: ContactCreate;
  let fixture: ComponentFixture<ContactCreate>;
  let messageService: { show: jest.Mock };

  beforeEach(async () => {
    messageService = { show: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ContactCreate],
      providers: [{ provide: MessageService, useValue: messageService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('no debe crear el contacto cuando el formulario es inválido', () => {
    component.onSubmit();

    expect(component.createdContact()).toBeNull();
    expect(messageService.show).not.toHaveBeenCalled();
  });

  it('debe crear el contacto y limpiar el formulario cuando es válido', () => {
    component.contactForm.setValue({
      firstName: ' Juan ',
      lastName: ' Pérez ',
      email: ' contacto@example.com ',
      phone: ' +593 999 999 999 ',
    });

    component.onSubmit();

    expect(component.createdContact()).toEqual({
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'contacto@example.com',
      phone: '+593 999 999 999',
    });
    expect(messageService.show).toHaveBeenCalledWith('Contacto creado correctamente');
    expect(component.contactForm.getRawValue()).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
    expect(component.submitting()).toBe(false);
  });
});
