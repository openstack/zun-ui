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
   * @ngdoc factory
   * @name horizon.dashboard.container.containers.kill.service
   * @description
   * Service to send kill signals to the container
   */
  angular
    .module('horizon.dashboard.container.containers')
    .factory(
      'horizon.dashboard.container.containers.kill.service',
      killContainerService);

  killContainerService.$inject = [
    '$q',
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.containers.adminActions',
    'horizon.dashboard.container.containers.basePath',
    'horizon.dashboard.container.containers.resourceType',
    'horizon.dashboard.container.containers.validStates',
    'horizon.framework.util.actions.action-result.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.form.ModalFormService',
    'horizon.framework.widgets.toast.service'
  ];

  function killContainerService(
    $q, zun, adminActions, basePath, resourceType, validStates,
    actionResult, gettext, $qExtensions, modal, toast
  ) {
    // schema
    var schema = {
      type: "object",
      properties: {
        signal: {
          title: gettext("Kill Signal"),
          type: "string"
        }
      }
    };

    // form
    var form = [
      {
        type: 'section',
        htmlClass: 'row',
        items: [
          {
            type: 'section',
            htmlClass: 'col-sm-6',
            items: [
              {
                "key": "signal",
                "placeholder": gettext("The kill signal to send.")
              }
            ]
          },
          {
            type: 'template',
            templateUrl: basePath + 'actions/kill.help.html'
          }
        ]
      }
    ];

    // model
    var model;

    var message = {
      success: gettext('Kill signal was successfully sent to container %s.')
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

    function allowed(container) {
      var adminAction = true;
      if (zun.isAdmin()) {
        adminAction = adminActions.indexOf("kill") >= 0;
      }
      return $q.all([
        $qExtensions.booleanAsPromise(adminAction),
        $qExtensions.booleanAsPromise(
          validStates.kill.indexOf(container.status) >= 0
        )
      ]);
    }

    function perform(selected) {
      model = {
        id: selected.id,
        name: selected.name,
        signal: ''
      };
      // modal config
      var config = {
        "title": gettext('Send Kill Signal'),
        "submitText": gettext('Send'),
        "schema": schema,
        "form": form,
        "model": model
      };
      return modal.open(config).then(submit);
    }

    function submit(context) {
      var id = context.model.id;
      var name = context.model.name;
      delete context.model.id;
      delete context.model.name;
      return zun.killContainer(id, context.model).then(function() {
        toast.add('success', interpolate(message.success, [name]));
        var result = actionResult.getActionResult().updated(resourceType, id);
        return result.result;
      });
    }
  }
})();
