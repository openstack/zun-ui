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
   * @name horizon.dashboard.container.containers.create.service
   * @description Service for the container create modal
   */
  angular
    .module('horizon.dashboard.container.containers')
    .factory('horizon.dashboard.container.containers.create.service', createService);

  createService.$inject = [
    '$q',
    'horizon.app.core.openstack-service-api.policy',
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.containers.adminActions',
    'horizon.dashboard.container.containers.resourceType',
    'horizon.dashboard.container.containers.workflow',
    'horizon.framework.util.actions.action-result.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.form.ModalFormService',
    'horizon.framework.widgets.toast.service'
  ];

  function createService(
    $q, policy, zun, adminActions, resourceType, workflow,
    actionResult, gettext, $qExtensions, modal, toast
  ) {
    var message = {
      success: gettext('Container %s was successfully created.')
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

    function perform() {
      var title, submitText;
      title = gettext('Create Container');
      submitText = gettext('Create');
      var config = workflow.init('create', title, submitText);
      return modal.open(config).then(submit);
    }

    function allowed() {
      var adminAction = true;
      if (zun.isAdmin()) {
        adminAction = adminActions.indexOf("create") >= 0;
      }
      return $q.all([
        policy.ifAllowed({ rules: [['container', 'add_container']] }),
        $qExtensions.booleanAsPromise(adminAction)
      ]);
    }

    function submit(context) {
      delete context.model.exit_policy;
      if (context.model.restart_policy === "on-failure") {
        if (!context.model.restart_policy_max_retry) {
          delete context.model.restart_policy_max_retry;
        } else {
          context.model.restart_policy =
            context.model.restart_policy + ":" +
            context.model.restart_policy_max_retry;
        }
      }
      delete context.model.restart_policy_max_retry;
      context.model.mounts = setMounts(context.model.mounts);
      delete context.model.availableCinderVolumes;
      context.model.nets = setNetworksAndPorts(context.model);
      context.model.security_groups = setSecurityGroups(context.model);
      delete context.model.networks;
      delete context.model.ports;
      delete context.model.availableNetworks;
      delete context.model.allocatedNetworks;
      delete context.model.availableSecurityGroups;
      delete context.model.allocatedSecurityGroups;
      delete context.model.availablePorts;
      context.model.hints = setSchedulerHints(context.model);
      delete context.model.availableHints;
      delete context.model.hintsTree;
      context.model = cleanNullProperties(context.model);
      return zun.createContainer(context.model).then(success);
    }

    function success(response) {
      response.data.id = response.data.uuid;
      toast.add('success', interpolate(message.success, [response.data.name]));
      var result = actionResult.getActionResult().created(resourceType, response.data.name);
      return result.result;
    }

    function cleanNullProperties(model) {
      // Initially clean fields that don't have any value.
      // Not only "null", blank too.
      for (var key in model) {
        if (model.hasOwnProperty(key) && model[key] === null || model[key] === "" ||
            key === "tabs" || (key === "auto_remove" && model[key] === false)) {
          delete model[key];
        }
      }
      return model;
    }

    function setMounts(mounts) {
      var mnts = [];
      mounts.forEach(function(mount) {
        if (mount.type === "cinder-available") {
          mnts.push({source: mount.source, destination: mount.destination});
        } else if (mount.type === "cinder-new") {
          mnts.push({source: "", size: mount.size.toString(), destination: mount.destination});
        }
      });
      return mnts;
    }

    function setNetworksAndPorts(model) {
      // pull out the ids from the security groups objects
      var nets = [];
      model.networks.forEach(function(network) {
        nets.push({network: network.id});
      });
      model.ports.forEach(function(port) {
        nets.push({port: port.id});
      });
      return nets;
    }

    function setSecurityGroups(model) {
      // pull out the ids from the security groups objects
      var securityGroups = [];
      model.security_groups.forEach(function(securityGroup) {
        securityGroups.push(securityGroup.name);
      });
      return securityGroups;
    }

    function setSchedulerHints(model) {
      var schedulerHints = {};
      if (model.hintsTree) {
        var hints = model.hintsTree.getExisting();
        if (!angular.equals({}, hints)) {
          angular.forEach(hints, function(value, key) {
            schedulerHints[key] = value + '';
          });
        }
      }
      return schedulerHints;
    }
  }
})();
