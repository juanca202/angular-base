import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MainLayout } from './main-layout';
import { AuthProvider, User } from 'auth-core';
import { MenuItem } from '@/shared/models/menu-item';
import {
  createMockRouter,
  createMockActivatedRoute,
  COMMON_TEST_PROVIDERS
} from '@/test/mocks/angular-mocks';

describe('MainLayout', () => {
  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;
  let mockAuthProvider: Partial<AuthProvider>;
  let mockBottomSheet: Partial<MatBottomSheet>;
  let mockRouter: ReturnType<typeof createMockRouter>;
  let mockActivatedRoute: ReturnType<typeof createMockActivatedRoute>;

  beforeEach(async () => {
    // Arrange: Create mocks
    const mockUser: User = {
      username: 'testuser',
      roles: ['user']
    };

    mockAuthProvider = {
      user: signal(mockUser),
      logout: vi.fn(),
      login: vi.fn().mockResolvedValue(true),
      isLoggedIn: signal(true)
    };

    mockBottomSheet = {
      open: vi.fn()
    };

    mockRouter = createMockRouter();
    mockActivatedRoute = createMockActivatedRoute();

    // Override component before configuring the module
    // Reemplaza templateUrl y styleUrl con template inline para evitar cargar archivos externos en las pruebas
    TestBed.overrideComponent(MainLayout, {
      remove: { templateUrl: './main-layout.html', styleUrl: './main-layout.css' },
      add: { template: '<div>Test</div>', styles: [] }
    });

    await TestBed.configureTestingModule({
      imports: [MainLayout, RouterModule],
      providers: [
        { provide: AuthProvider, useValue: mockAuthProvider },
        { provide: MatBottomSheet, useValue: mockBottomSheet },
        ...COMMON_TEST_PROVIDERS.getRouterProviders(mockRouter, mockActivatedRoute)
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create component', () => {
      // Arrange & Act & Assert
      expect(component).toBeTruthy();
    });

    it('should initialize with empty navigation options', () => {
      // Arrange & Act
      const navigationOptions = component.navigationOptions();

      // Assert
      expect(navigationOptions).toEqual([]);
    });

    it('should initialize with null selected option', () => {
      // Arrange & Act
      const selectedOption = component.selectedOption();

      // Assert
      expect(selectedOption).toBeNull();
    });

    it('should initialize with collapsed as false', () => {
      // Arrange & Act
      const collapsed = component.collapsed();

      // Assert
      expect(collapsed).toBe(false);
    });

    it('should inject dependencies', () => {
      // Arrange & Act & Assert
      expect(component.authProvider).toBeDefined();
      expect(component.bottomSheet).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should call ngOnInit without errors', () => {
      // Arrange & Act
      component.ngOnInit();

      // Assert
      expect(component).toBeTruthy();
    });
  });

  describe('toggleCollapse', () => {
    it('should toggle collapsed from false to true', () => {
      // Arrange
      expect(component.collapsed()).toBe(false);

      // Act
      component.toggleCollapse();

      // Assert
      expect(component.collapsed()).toBe(true);
    });

    it('should toggle collapsed from true to false', () => {
      // Arrange
      component.collapsed.set(true);
      expect(component.collapsed()).toBe(true);

      // Act
      component.toggleCollapse();

      // Assert
      expect(component.collapsed()).toBe(false);
    });

    it('should toggle collapsed multiple times', () => {
      // Arrange
      expect(component.collapsed()).toBe(false);

      // Act
      component.toggleCollapse();
      expect(component.collapsed()).toBe(true);

      component.toggleCollapse();
      expect(component.collapsed()).toBe(false);

      component.toggleCollapse();
      // Assert
      expect(component.collapsed()).toBe(true);
    });
  });

  describe('navigationOptions', () => {
    it('should allow setting navigation options', () => {
      // Arrange
      const menuItems: MenuItem[] = [
        { url: '/home', label: 'Home', icon: 'home' },
        { url: '/about', label: 'About', icon: 'info' }
      ];

      // Act
      component.navigationOptions.set(menuItems);

      // Assert
      expect(component.navigationOptions()).toEqual(menuItems);
    });
  });

  describe('selectedOption', () => {
    it('should allow setting selected option', () => {
      // Arrange
      const menuItem: MenuItem = {
        url: '/home',
        label: 'Home',
        icon: 'home',
        children: [{ url: '/home/dashboard', label: 'Dashboard', icon: 'dashboard' }]
      };

      // Act
      component.selectedOption.set(menuItem);

      // Assert
      expect(component.selectedOption()).toEqual(menuItem);
    });
  });
});
