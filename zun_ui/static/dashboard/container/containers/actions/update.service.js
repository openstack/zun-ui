/**
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
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
   * @ngdoc overview
   * @name horizon.dashboard.container.containers.update.service
   * @description Service for the container update modal
   */
  angular
    .module('horizon.dashboard.container.containers')
    .factory('horizon.dashboard.container.containers.update.service', updateService);

  updateService.$inject = [
    '$q',
    'horizon.app.core.openstack-service-api.policy',
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.containers.adminActions',
    'horizon.dashboard.container.containers.resourceType',
    'horizon.dashboard.container.containers.validStates',
    'horizon.dashboard.container.containers.workflow',
    'horizon.framework.util.actions.action-result.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.form.ModalFormService',
    'horizon.framework.widgets.toast.service'
  ];

  function updateService(
    $q, policy, zun, adminActions, resourceType, validStates, workflow,
    actionResult, gettext, $qExtensions, modal, toast
  ) {
    var message = {
      success: gettext('Container %s was successfully updated.'),
      successAttach: gettext('Network %s was successfully attached to container %s.'),
      successDetach: gettext('Network %s was successfully detached from container %s.')
    };

    var service = {
      initAction: initAction,
      perform: perform,
      allowed: allowed
    };

    return service;

    //////////////

    function initAction() {
    }

    function perform(selected) {
      var title, submitText;
      title = gettext('Update Container');
      submitText = gettext('Update');
      var config = workflow.init('update', title, submitText, selected.id);
      return modal.open(config).then(submit);
    }

    function allowed(container) {
      var adminAction = true;
      if (zun.isAdmin()) {
        adminAction = adminActions.indexOf("update") >= 0;
      }
      return $q.all([
        policy.ifAllowed({ rules: [['container', 'edit_container']] }),
        $qExtensions.booleanAsPromise(adminAction),
        $qExtensions.booleanAsPromise(
          validStates.update.indexOf(container.status) >= 0
        )
      ]);
    }

    function submit(context) {
      var id = context.model.id;
      var newNets = [];
      context.model.networks.forEach(function (newNet) {
        newNets.push(newNet.id);
      });
      changeNetworks(id, context.model.allocatedNetworks, newNets);
      delete context.model.networks;
      delete context.model.availableNetworks;
      delete context.model.allocatedNetworks;
      context.model = cleanUpdateProperties(context.model);
      return $q.all([
        zun.updateContainer(id, context.model).then(success)
      ]);
    }

    function success(response) {
      response.data.id = response.data.uuid;
      toast.add('success', interpolate(message.success, [response.data.name]));
      var result = actionResult.getActionResult().updated(resourceType, response.data.name);
      return result.result;
    }

    function cleanUpdateProperties(model) {
      // Initially clean fields that don't have any value.
      // Not only "null", blank too.
      // only "cpu" and "memory" fields are editable.
      for (var key in model) {
        if (model.hasOwnProperty(key) && model[key] === null || model[key] === "" ||
            (key !== "name" && key !== "cpu" && key !== "memory" && key !== "nets")) {
          delete model[key];
        }
      }
      return model;
    }

    function changeNetworks(container, oldNets, newNets) {
      // attach and detach networks
      var attachedNets = [];
      var detachedNets = [];
      newNets.forEach(function(newNet) {
        if (!oldNets.includes(newNet)) {
          attachedNets.push(newNet);
        }
      });
      oldNets.forEach(function(oldNet) {
        if (!newNets.includes(oldNet)) {
          detachedNets.push(oldNet);
        }
      });
      attachedNets.forEach(function (net) {
        zun.attachNetwork(container, net).then(successAttach);
      });
      detachedNets.forEach(function (net) {
        zun.detachNetwork(container, net).then(successDetach);
      });
    }

    function successAttach(response) {
      toast.add('success', interpolate(message.successAttach,
        [response.data.network, response.data.container]));
      var result = actionResult.getActionResult().updated(resourceType, response.data.container);
      return result.result;
    }

    function successDetach(response) {
      toast.add('success', interpolate(message.successDetach,
        [response.data.network, response.data.container]));
      var result = actionResult.getActionResult().updated(resourceType, response.data.container);
      return result.result;
    }
  }
})();
