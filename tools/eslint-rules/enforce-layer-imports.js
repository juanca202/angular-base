const FEATURE_PREFIX = 'feature:';

const describeLayer = (layer) => {
  if (!layer) {
    return 'unknown layer';
  }
  if (layer.startsWith(FEATURE_PREFIX)) {
    return `feature "${layer.replace(FEATURE_PREFIX, '')}"`;
  }
  return layer;
};

const extractLayer = (filename) => {
  const normalized = filename.replace(/\\/g, '/');
  const marker = '/src/app/';
  const markerIndex = normalized.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }
  const relativePath = normalized.slice(markerIndex + marker.length);
  const segments = relativePath.split('/');
  const [segment] = segments;
  if (!segment) {
    return null;
  }
  if (!relativePath.includes('/')) {
    if (relativePath.startsWith('app.')) {
      return 'bootstrap';
    }
    return 'core';
  }
  if (segment === 'core' || segment === 'shared') {
    return segment;
  }
  // features/settings/... or features/templates/... → feature name is second segment
  if (segment === 'features' && segments.length > 1) {
    return `${FEATURE_PREFIX}${segments[1]}`;
  }
  return `${FEATURE_PREFIX}${segment}`;
};

const extractLayerFromImport = (importPath, crossLayerPackages = []) => {
  if (typeof importPath !== 'string') {
    return null;
  }
  const path = importPath.trim();

  // Cross layer: packages configured as cross (auth-core, auth-msal, monitoring, etc.)
  for (const pkg of crossLayerPackages) {
    if (path === pkg || path.startsWith(pkg + '/')) {
      return 'auth';
    }
  }

  // Path aliases: @/core, @/shared, @/features, @/cross
  if (path.startsWith('@/core') || path.startsWith('@/core/')) {
    return 'core';
  }
  if (path.startsWith('@/shared') || path.startsWith('@/shared/')) {
    return 'shared';
  }
  if (path.startsWith('@/cross') || path.startsWith('@/cross/')) {
    return 'auth';
  }
  if (path.startsWith('@/features/')) {
    const parts = path.slice('@/features/'.length).split('/');
    const featureName = parts[0];
    return featureName ? `${FEATURE_PREFIX}${featureName}` : null;
  }

  // Legacy app/ prefix
  if (path.startsWith('app/')) {
    const [, ...rest] = path.split('/');
    const [segment] = rest;
    if (!segment) {
      return 'core';
    }
    if (segment.includes('.')) {
      return 'core';
    }
    if (segment === 'core' || segment === 'shared') {
      return segment;
    }
    return `${FEATURE_PREFIX}${segment}`;
  }

  return null;
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce ADR-001 dependency direction between Core, Shared and Features',
      recommended: false
    },
    schema: [
      {
        type: 'object',
        properties: {
          crossLayerPackages: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Package names that belong to the Cross layer (e.g. auth-core, auth-msal). Core cannot import from these.'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      invalidDependency: '{{from}} cannot import from {{to}} (see ADR-001).'
    }
  },
  defaultOptions: [{ crossLayerPackages: ['auth-core', 'auth-msal'] }],
  create(context, options) {
    const opts = Array.isArray(options) && options.length > 0 ? options[0] : {};
    const { crossLayerPackages = [] } = opts;
    return {
      ImportDeclaration(node) {
        const fromLayer = extractLayer(context.getFilename());
        if (!fromLayer || fromLayer === 'bootstrap') {
          return;
        }
        const targetLayer = extractLayerFromImport(node.source.value, crossLayerPackages);
        if (!targetLayer) {
          return;
        }

        const fromIsFeature = fromLayer.startsWith(FEATURE_PREFIX);
        const toIsFeature = targetLayer.startsWith(FEATURE_PREFIX);
        const toIsAuth = targetLayer === 'auth';

        // Core cannot import from Shared, Auth, or Features (ADR-001)
        if (fromLayer === 'core' && (targetLayer === 'shared' || toIsAuth || toIsFeature)) {
          context.report({
            node,
            messageId: 'invalidDependency',
            data: {
              from: describeLayer(fromLayer),
              to: describeLayer(targetLayer)
            }
          });
          return;
        }

        // Shared cannot import from Features
        if (!fromIsFeature && toIsFeature) {
          context.report({
            node,
            messageId: 'invalidDependency',
            data: {
              from: describeLayer(fromLayer),
              to: describeLayer(targetLayer)
            }
          });
          return;
        }

        // Feature cannot import from another Feature (different feature)
        if (fromIsFeature && toIsFeature && fromLayer !== targetLayer) {
          context.report({
            node,
            messageId: 'invalidDependency',
            data: {
              from: describeLayer(fromLayer),
              to: describeLayer(targetLayer)
            }
          });
        }
      }
    };
  }
};
