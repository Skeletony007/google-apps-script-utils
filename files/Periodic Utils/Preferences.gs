/**
 * The hierarchical preferences.
 * <p>
 * Used by functions called in the function body of <code>main()</code> in <code>Main</code>.
 *
 * @see Main#main()
 */
var preferences = {
  gmailUtil: {
    userId: 'me',
    genericLabelResource: {
      labelListVisibility: 'labelHide',
      messageListVisibility: 'show',
      color: {
        textColor: '#ffffff',
        backgroundColor: '#434343'
      }
    },
    sublabelCleanerResource:{
      /**
       * The expected label names for each parent label name.
       * <p>
       * Subdirectories of the parent label are recursively cleaned up by
       * <code>gmailSublabelCleaner()</code>.
       * <p>
       * Example:
       * <code>
       * targetLabelNames: {
       *   'uol/ntfy': ['uol'],
       *   'pm/acc': ['pm']
       * },
       * </code>
       *
       * @see GmailUtils#sublabelCleaner()
       */
      targetLabelNames: {
      },
      warningLabelName: 'pending-delete',
      warningLabelDay: 14,
      deleteDay: 21
    }
  }
};
