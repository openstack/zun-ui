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
   * @name horizon.dashboard.container.capsules.actions.create.service
   * @description
   * Service for the create capsule modal
   */
  angular
    .module('horizon.dashboard.container.capsules.actions')
    .factory('horizon.dashboard.container.capsules.actions.create.service', createCapsuleService);

  createCapsuleService.$inject = [
    'horizon.app.core.openstack-service-api.policy',
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.capsules.actions.workflow',
    'horizon.dashboard.container.capsules.resourceType',
    'horizon.framework.util.actions.action-result.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.form.ModalFormService',
    'horizon.framework.widgets.toast.service'
  ];

  function createCapsuleService(
    policy, zun, workflow, resourceType,
    actionResult, gettext, $qExtensions, modal, toast
  ) {

    var message = {
      success: gettext('Request to create capsule %s has been accepted.')
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
      title = gettext('Create Capsule');
      submitText = gettext('Create');
      var config = workflow.init('create', title, submitText);
      return modal.open(config).then(submit);
    }

    function allowed() {
      return policy.ifAllowed({ rules: [['capsule', 'create_capsule']] });
    }

    function submit(context) {
      return zun.createCapsule(context.model, true).then(success, true);
    }

    function success(response) {
      toast.add('success', interpolate(message.success, [response.data.id]));
      var result = actionResult.getActionResult().created(resourceType, response.data.name);
      return result.result;
    }
  }
})();
