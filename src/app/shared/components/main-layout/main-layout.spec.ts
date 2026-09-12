import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { NO_ERRORS_SCHEMA, computed, signal } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MainLayout } from '@/shared/components/main-layout/main-layout';
import { AuthProvider, User } from '@factor_ec/utils';
import { Session } from '@/core/services/session';
import { MenuItem } from '@/shared/models/menu-item';
import { Settings } from '@/core/models/settings';
import {
  createMockRouter,
  createMockActivatedRoute,
  COMMON_TEST_PROVIDERS
} from '@/test/mocks/angular-mocks';
import { createMockSession } from '@/test/mocks/service-mocks';

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
        { provide: Session, useValue: createMockSession() },
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

  describe('template rendering', () => {
    let renderFixture: ComponentFixture<MainLayout>;
    let renderComponent: MainLayout;

    const mockSettings: Settings = {
      user: {
        username: 'testuser',
        roles: ['user'],
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        picture: '',
        featureFlags: []
      },
      language: 'en',
      subscription: { code: 'sub', name: 'Subscription', plan: { code: 'plan', name: 'Plan' } },
      environment: 'test',
      onboarding: false,
      country: 'EC'
    };

    const menuItems: MenuItem[] = [
      {
        url: '/home',
        label: 'Home',
        icon: 'home',
        children: [{ url: '/home/dashboard', label: 'Dashboard', icon: 'dashboard' }]
      },
      { url: '/about', label: 'About', icon: 'info' }
    ];

    beforeEach(async () => {
      // Arrange: render the real template (no override), with a populated session
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [MainLayout, RouterModule],
        providers: [
          { provide: AuthProvider, useValue: mockAuthProvider },
          { provide: MatBottomSheet, useValue: mockBottomSheet },
          {
            provide: Session,
            useValue: createMockSession({ settings: computed(() => mockSettings) })
          },
          ...COMMON_TEST_PROVIDERS.getRouterProviders(mockRouter, mockActivatedRoute),
          ...COMMON_TEST_PROVIDERS.getUIOptionsProvider()
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      renderFixture = TestBed.createComponent(MainLayout);
      renderComponent = renderFixture.componentInstance;
      renderComponent.navigationOptions.set(menuItems);
      renderFixture.detectChanges();
    });

    it('should render a button for each navigation option', () => {
      // Act
      const buttons = renderFixture.nativeElement.querySelectorAll('.ft-navbar__actions button');

      // Assert
      expect(buttons.length).toBe(menuItems.length);
      expect(buttons[0].textContent).toContain('Home');
      expect(buttons[1].textContent).toContain('About');
    });

    it('should not render children submenu when no option is selected', () => {
      // Act
      const actionsBlocks = renderFixture.nativeElement.querySelectorAll('.ft-navbar__actions');

      // Assert: only the top-level actions block is rendered
      expect(actionsBlocks.length).toBe(1);
    });

    it('should render children submenu when the selected option has children', () => {
      // Act
      renderComponent.selectedOption.set(menuItems[0]);
      renderFixture.detectChanges();
      const actionsBlocks = renderFixture.nativeElement.querySelectorAll('.ft-navbar__actions');

      // Assert
      expect(actionsBlocks.length).toBe(2);
      expect(actionsBlocks[1].textContent).toContain('Dashboard');
    });

    it('should set selected option when a navigation button is clicked', () => {
      // Act
      const firstButton: HTMLButtonElement =
        renderFixture.nativeElement.querySelectorAll('.ft-navbar__actions button')[0];
      firstButton.click();
      renderFixture.detectChanges();

      // Assert
      expect(renderComponent.selectedOption()).toEqual(menuItems[0]);
    });

    it('should render the session user profile information', () => {
      // Act
      const profileLabel = renderFixture.nativeElement.querySelector('.ft-item__label');

      // Assert
      expect(profileLabel.textContent).toContain('Ada Lovelace');
      expect(profileLabel.textContent).toContain('ada@example.com');
    });

    it('should toggle the collapsed class when the splitter is clicked', () => {
      // Arrange
      const navbar: HTMLElement = renderFixture.nativeElement.querySelector('.ft-navbar');
      const splitter: HTMLElement = renderFixture.nativeElement.querySelector('.ft-splitter');
      expect(navbar.classList).not.toContain('ft-navbar--collapsed');

      // Act
      splitter.click();
      renderFixture.detectChanges();

      // Assert
      expect(navbar.classList).toContain('ft-navbar--collapsed');
    });
  });
});
