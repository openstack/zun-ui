/**
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use self file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  /**
   * @ngDoc factory
   * @name horizon.dashboard.container.containers.delete.service
   * @Description
   * Brings up the delete containers confirmation modal dialog.
   * On submit, delete selected resources.
   * On cancel, do nothing.
   */
  angular
    .module('horizon.dashboard.container.containers')
    .factory('horizon.dashboard.container.containers.delete.service', deleteService);

  deleteService.$inject = [
    '$location',
    '$q',
    '$rootScope',
    'horizon.app.core.openstack-service-api.zun',
    'horizon.app.core.openstack-service-api.policy',
    'horizon.framework.util.actions.action-result.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.modal.deleteModalService',
    'horizon.framework.widgets.table.events',
    'horizon.framework.widgets.toast.service',
    'horizon.dashboard.container.containers.adminActions',
    'horizon.dashboard.container.containers.resourceType',
    'horizon.dashboard.container.containers.events',
    'horizon.dashboard.container.containers.validStates'
  ];

  function deleteService(
    $location, $q, $rootScope, zun, policy, actionResult, gettext, $qExtensions, deleteModal,
    tableEvents, toast, adminActions, resourceType, events, validStates
  ) {
    var scope;
    var context = {
      labels: null,
      deleteEntity: deleteEntity,
      successEvent: events.DELETE_SUCCESS
    };
    var service = {
      initAction: initAction,
      allowed: allowed,
      perform: perform
    };
    var notAllowedMessage = gettext("You are not allowed to delete containers: %s");

    return service;

    //////////////

    function initAction() {
    }

    function allowed(container) {
      var adminAction = true;
      if (zun.isAdmin()) {
        adminAction = adminActions.indexOf("delete") >= 0;
      }
      // only row actions pass in container
      // otherwise, assume it is a batch action
      var state;
      if (container) {
        state = $qExtensions.booleanAsPromise(
          validStates.delete.indexOf(container.status) >= 0
        );
      } else {
        state = $qExtensions.booleanAsPromise(true);
      }
      return $q.all([
        $qExtensions.booleanAsPromise(adminAction),
        state
      ]);
    }

    // delete selected resource objects
    function perform(selected, newScope) {
      scope = newScope;
      selected = angular.isArray(selected) ? selected : [selected];
      context.labels = labelize(selected.length);
      return $qExtensions.allSettled(selected.map(checkPermission)).then(afterCheck);
    }

    function labelize(count) {
      return {
        title: ngettext('Confirm Delete Container',
                        'Confirm Delete Containers', count),
        /* eslint-disable max-len */
        message: ngettext('You have selected "%s". Please confirm your selection. Deleted container is not recoverable.',
                          'You have selected "%s". Please confirm your selection. Deleted containers are not recoverable.', count),
        /* eslint-enable max-len */
        submit: ngettext('Delete Container',
                         'Delete Containers', count),
        success: ngettext('Deleted Container: %s.',
                          'Deleted Containers: %s.', count),
        error: ngettext('Unable to delete Container: %s.',
                        'Unable to delete Containers: %s.', count)
      };
    }

    // for batch delete
    function checkPermission(selected) {
      return {promise: allowed(selected), context: selected};
    }

    // for batch delete
    function afterCheck(result) {
      var outcome = $q.reject();  // Reject the promise by default
      if (result.fail.length > 0) {
        toast.add('error', getMessage(notAllowedMessage, result.fail));
        outcome = $q.reject(result.fail);
      }
      if (result.pass.length > 0) {
        outcome = deleteModal.open(scope, result.pass.map(getEntity), context).then(createResult);
      }
      return outcome;
    }

    function createResult(deleteModalResult) {
      // To make the result of this action generically useful, reformat the return
      // from the deleteModal into a standard form
      var result = actionResult.getActionResult();
      deleteModalResult.pass.forEach(function markDeleted(item) {
        result.updated(resourceType, getEntity(item).id);
      });
      deleteModalResult.fail.forEach(function markFailed(item) {
        result.failed(resourceType, getEntity(item).id);
      });
      var indexPath = '/project/container/containers';
      var currentPath = $location.path();
      if (result.result.failed.length === 0 && result.result.updated.length > 0 &&
          currentPath !== indexPath) {
        $location.path(indexPath);
      } else {
        $rootScope.$broadcast(tableEvents.CLEAR_SELECTIONS);
        return result.result;
      }
    }

    function getMessage(message, entities) {
      return interpolate(message, [entities.map(getName).join(", ")]);
    }

    function getName(result) {
      return getEntity(result).name;
    }

    // for batch delete
    function getEntity(result) {
      return result.context;
    }

    // call delete REST API
    function deleteEntity(id) {
      return zun.deleteContainer(id, true);
    }
  }
})();
