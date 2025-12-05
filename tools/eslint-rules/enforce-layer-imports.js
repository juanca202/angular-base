const FEATURE_PREFIX = 'feature:';

const CORE_AUTH_EXPORTS = new Set(['auth-service', 'auth-guards', 'auth-interceptor']);

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
  const [segment] = relativePath.split('/');
  if (!segment) {
    return null;
  }
  const hasSubPath = relativePath.includes('/');
  if (!hasSubPath) {
    return 'core';
  }
  if (segment === 'core' || segment === 'shared') {
    return segment;
  }
  if (segment === 'auth') {
    const remainder = relativePath.split('/').slice(1);
    const nextSegment = remainder[0];
    if (CORE_AUTH_EXPORTS.has(nextSegment)) {
      return 'core';
    }
  }
  return `${FEATURE_PREFIX}${segment}`;
};

const extractLayerFromImport = (importPath) => {
  if (typeof importPath !== 'string' || !importPath.startsWith('app/')) {
    return null;
  }
  const [, segment] = importPath.split('/');
  if (!segment) {
    return null;
  }
  const remainder = importPath.split('/').slice(2);
  if (!remainder.length) {
    return segment === 'core' || segment === 'shared' ? segment : 'core';
  }
  if (segment === 'core' || segment === 'shared') {
    return segment;
  }
  if (segment === 'auth') {
    const nextSegment = remainder[0];
    if (CORE_AUTH_EXPORTS.has(nextSegment)) {
      return 'core';
    }
  }
  return `${FEATURE_PREFIX}${segment}`;
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce ADR-001 dependency direction between Core, Shared and Features',
      recommended: false
    },
    schema: [],
    messages: {
      invalidDependency: '{{from}} cannot import from {{to}} (see ADR-001).'
    }
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node) {
        const fromLayer = extractLayer(context.getFilename());
        if (!fromLayer) {
          return;
        }
        const targetLayer = extractLayerFromImport(node.source.value);
        if (!targetLayer) {
          return;
        }

        const fromIsFeature = fromLayer.startsWith(FEATURE_PREFIX);
        const toIsFeature = targetLayer.startsWith(FEATURE_PREFIX);

        if (!fromIsFeature && toIsFeature) {
          // Core or shared importing a feature.
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

        if (fromIsFeature && toIsFeature && fromLayer !== targetLayer) {
          // Feature to feature import with different targets.
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
