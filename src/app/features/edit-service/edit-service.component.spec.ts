/* tslint:disable:no-unused-variable */
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EditServiceComponent } from './edit-service.component';

describe('EditServiceComponent', () => {
  let component: EditServiceComponent;
  let fixture: ComponentFixture<EditServiceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EditServiceComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('subcategory helpers', () => {
    beforeEach(() => {
      component.subcategories = [
        { value: 'x', label: 'X' },
        { value: 'y', label: 'Y' },
      ];
      fixture.detectChanges();
    });

    it('toggleSubcategory toggles selection', () => {
      expect(component.isSubcategorySelected('x')).toBeFalse();
      component.toggleSubcategory('x');
      expect(component.isSubcategorySelected('x')).toBeTrue();
    });

    it('toggleSubcategoryByValue maps label to value', () => {
      component.toggleSubcategoryByValue('X', true);
      expect(component.isSubcategorySelected('x')).toBeTrue();
      component.toggleSubcategoryByValue('x', false);
      expect(component.isSubcategorySelected('x')).toBeFalse();
    });

    it('getSelectedSubcategoryLabels with selections', () => {
      component.toggleSubcategory('y');
      const labels = component.getSelectedSubcategoryLabels();
      expect(labels).toEqual(['Y']);
    });
  });
});
