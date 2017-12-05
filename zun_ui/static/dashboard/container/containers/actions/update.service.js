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
    $q, policy, zun, resourceType, validStates, workflow,
    actionResult, gettext, $qExtensions, modal, toast
  ) {
    var message = {
      success: gettext('Container %s was successfully updated.')
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
      var config = workflow.init('update', title, submitText);
      config.model.id = selected.id;

      // load current data
      zun.getContainer(selected.id).then(onLoad);
      function onLoad(response) {
        config.model.name = response.data.name
          ? response.data.name : "";
        config.model.image = response.data.image
          ? response.data.image : "";
        config.model.image_driver = response.data.image_driver
          ? response.data.image_driver : "docker";
        config.model.image_pull_policy = response.data.image_pull_policy
          ? response.data.image_pull_policy : "";
        config.model.command = response.data.command
          ? response.data.command : "";
        config.model.hostname = response.data.hostname
          ? response.data.hostname : "";
        config.model.cpu = response.data.cpu
          ? response.data.cpu : "";
        config.model.memory = response.data.memory
          ? parseInt(response.data.memory, 10) : "";
        config.model.restart_policy = response.data.restart_policy.Name
          ? response.data.restart_policy.Name : "";
        config.model.restart_policy_max_retry = response.data.restart_policy.MaximumRetryCount
          ? parseInt(response.data.restart_policy.MaximumRetryCount, 10) : null;
        config.model.runtime = response.data.runtime
          ? response.data.runtime : "";
        config.model.workdir = response.data.workdir
          ? response.data.workdir : "";
        config.model.environment = response.data.environment
          ? hashToString(response.data.environment) : "";
        config.model.interactive = response.data.interactive
          ? response.data.interactive : false;
        config.model.auto_remove = response.data.auto_remove
          ? response.data.auto_remove : false;
        config.model.labels = response.data.labels
          ? hashToString(response.data.labels) : "";
      }

      return modal.open(config).then(submit);
    }

    function allowed(container) {
      return $q.all([
        policy.ifAllowed({ rules: [['container', 'edit_container']] }),
        $qExtensions.booleanAsPromise(
          validStates.update.indexOf(container.status) >= 0
        )
      ]);
    }

    function submit(context) {
      var id = context.model.id;
      context.model = cleanUpdateProperties(context.model);
      return zun.updateContainer(id, context.model).then(success);
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
            (key !== "name" && key !== "cpu" && key !== "memory")) {
          delete model[key];
        }
      }
      return model;
    }

    function hashToString(hash) {
      var str = "";
      for (var key in hash) {
        if (hash.hasOwnProperty(key)) {
          if (str.length > 0) {
            str += ",";
          }
          str += key + "=" + hash[key];
        }
      }
      return str;
    }
  }
})();
