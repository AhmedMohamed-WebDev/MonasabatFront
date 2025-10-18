/* tslint:disable:no-unused-variable */
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddServiceComponent } from './add-service.component';

describe('AddServiceComponent', () => {
  let component: AddServiceComponent;
  let fixture: ComponentFixture<AddServiceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddServiceComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('subcategory helpers', () => {
    beforeEach(() => {
      // initialize a small set of subcategories
      component.subcategories = [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
        { value: 'c', label: 'C' },
      ];
      // component and form were already initialized by fixture.detectChanges() in outer beforeEach
      fixture.detectChanges();
    });

    it('toggleSubcategory should add and remove values', () => {
      expect(component.isSubcategorySelected('a')).toBeFalse();
      component.toggleSubcategory('a');
      expect(component.isSubcategorySelected('a')).toBeTrue();
      component.toggleSubcategory('a');
      expect(component.isSubcategorySelected('a')).toBeFalse();
    });

    it('toggleSubcategoryByValue should accept label and value', () => {
      component.toggleSubcategoryByValue('A', true);
      expect(component.isSubcategorySelected('a')).toBeTrue();
      component.toggleSubcategoryByValue('a', false);
      expect(component.isSubcategorySelected('a')).toBeFalse();
    });

    it('getSelectedSubcategoryLabels returns translated labels', () => {
      component.toggleSubcategory('b');
      const labels = component.getSelectedSubcategoryLabels();
      expect(labels).toEqual(['B']);
    });

    it('handles empty selection gracefully', () => {
      expect(component.getSelectedSubcategoryLabels()).toEqual([]);
    });
  });
});
