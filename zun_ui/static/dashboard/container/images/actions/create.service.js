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
   * @ngdoc factory
   * @name horizon.dashboard.container.images.create.service
   * @description
   * Service for the pull image modal
   */
  angular
    .module('horizon.dashboard.container.images.actions')
    .factory('horizon.dashboard.container.images.actions.create.service', createImageService);

  createImageService.$inject = [
    'horizon.app.core.openstack-service-api.policy',
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.images.actions.workflow',
    'horizon.dashboard.container.images.resourceType',
    'horizon.framework.util.actions.action-result.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.form.ModalFormService',
    'horizon.framework.widgets.toast.service'
  ];

  function createImageService(
    policy, zun, workflow, resourceType,
    actionResult, gettext, $qExtensions, modal, toast
  ) {

    var message = {
      success: gettext('Image %s was successfully pulled.')
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
      title = gettext('Pull Image');
      submitText = gettext('Pull');
      var config = workflow.init('create', title, submitText);
      return modal.open(config).then(submit);
    }

    function allowed() {
      return policy.ifAllowed({ rules: [['image', 'pull_image']] });
    }

    function submit(context) {
      return zun.pullImage(context.model, true).then(success, true);
    }

    function success(response) {
      toast.add('success', interpolate(message.success, [response.data.id]));
      var result = actionResult.getActionResult().created(resourceType, response.data.name);
      return result.result;
    }
  }
})();
