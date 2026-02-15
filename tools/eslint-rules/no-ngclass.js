module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow ngClass bindings in templates (ADR-002 / ADR-005)',
      recommended: false
    },
    schema: [],
    messages: {
      noNgClass: 'Use explicit class bindings instead of ngClass (see ADR-002 / ADR-005).'
    }
  },
  create(context) {
    return {
      BoundAttribute(node) {
        if (node.name === 'ngClass') {
          context.report({
            loc: context.parserServices.convertNodeSourceSpanToLoc(node.sourceSpan),
            messageId: 'noNgClass'
          });
        }
      }
    };
  }
};
