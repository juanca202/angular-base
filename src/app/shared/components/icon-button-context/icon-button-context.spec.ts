import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconButtonContext } from '@/shared/components/icon-button-context/icon-button-context';
import { Action } from '@/core/models/action';
import { ACTION_TYPE } from '@/core/constants/action-type';

describe('IconButtonContext', () => {
  let component: IconButtonContext;
  let fixture: ComponentFixture<IconButtonContext>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconButtonContext]
    }).compileComponents();

    fixture = TestBed.createComponent(IconButtonContext);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render the trigger button when there are no items', () => {
    // Act
    fixture.detectChanges();

    // Assert
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('should render the trigger button when there are items', () => {
    // Arrange
    const items: Action[] = [
      { id: 'group-1', type: ACTION_TYPE.GROUP, children: [{ id: 'action-1', label: 'Edit', type: ACTION_TYPE.ITEM }] }
    ];
    fixture.componentRef.setInput('items', items);

    // Act
    fixture.detectChanges();

    // Assert
    expect(fixture.nativeElement.querySelector('button')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('ft-icon')).not.toBeNull();
  });

  it('should stop click propagation on the trigger button', () => {
    // Arrange
    const items: Action[] = [
      { id: 'group-1', type: ACTION_TYPE.GROUP, children: [{ id: 'action-1', label: 'Edit', type: ACTION_TYPE.ITEM }] }
    ];
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();

    const parent: HTMLElement = fixture.nativeElement;
    let bubbled = false;
    parent.addEventListener('click', () => (bubbled = true));

    // Act
    const button: HTMLButtonElement = parent.querySelector('button')!;
    button.click();

    // Assert
    expect(bubbled).toBe(false);
  });
});
