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
   * @name horizon.dashboard.container.containers.execute.service
   * @description
   * Service for the command execution in the container
   */
  angular
    .module('horizon.dashboard.container.containers')
    .factory(
      'horizon.dashboard.container.containers.execute.service',
      executeContainerService);

  executeContainerService.$inject = [
    '$q',
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.containers.adminActions',
    'horizon.dashboard.container.containers.resourceType',
    'horizon.dashboard.container.containers.validStates',
    'horizon.framework.util.actions.action-result.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.form.ModalFormService',
    'horizon.framework.widgets.modal-wait-spinner.service',
    'horizon.framework.widgets.toast.service'
  ];

  function executeContainerService(
    $q, zun, adminActions, resourceType, validStates, actionResult,
    gettext, $qExtensions, modal, waitSpinner, toast
  ) {
    // schema
    var schema = {
      type: "object",
      properties: {
        command: {
          title: gettext("Command"),
          type: "string"
        },
        output: {
          title: gettext("Output"),
          type: "string"
        }
      }
    };

    // form
    var form = [
      {
        type: "section",
        htmlClass: "col-sm-12",
        items: [
          { // for result message
            type: "help",
            helpvalue: "",
            condition: true
          },
          {
            key: "command",
            placeholder: gettext("The command to execute."),
            required: true
          },
          { // for exit code
            type: "help",
            helpvalue: "",
            condition: true
          },
          {
            key: "output",
            type: "textarea",
            readonly: true,
            condition: true
          }
        ]
      }
    ];

    // model
    var model = {
      id: '',
      name: '',
      command: ''
    };

    // modal config
    var config = {
      title: gettext("Execute Command"),
      submitText: gettext("Execute"),
      schema: schema,
      form: angular.copy(form),
      model: model
    };

    var message = {
      success: gettext("Command was successfully executed at container %s."),
      exit_code: gettext("Exit Code")
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
        adminAction = adminActions.indexOf("execute") >= 0;
      }
      return $q.all([
        $qExtensions.booleanAsPromise(adminAction),
        $qExtensions.booleanAsPromise(
          validStates.execute.indexOf(container.status) >= 0
        )
      ]);
    }

    function perform(selected) {
      config.model.id = selected.id;
      config.model.name = selected.name;
      config.model.command = '';
      config.model.output = '';
      config.form = angular.copy(form);
      modal.open(config).then(submit);
    }

    function submit(context) {
      var id = context.model.id;
      var name = context.model.name;
      delete context.model.id;
      delete context.model.name;
      delete context.model.output;
      waitSpinner.showModalSpinner(gettext('Executing'));
      return zun.executeContainer(id, context.model).then(function(response) {
        config.model = {
          id: id,
          name: name,
          command: context.model.command,
          output: response.data.output
        };
        config.form = angular.copy(form);

        // for result message
        config.form[0].items[0].helpvalue = "<div class='alert alert-success'>" +
          interpolate(message.success, [name]) + "</div>";
        config.form[0].items[0].condition = false;

        // for exit_code
        var resClass = 'success';
        if (response.data.exit_code !== 0) {
          resClass = 'danger';
        }
        config.form[0].items[2].condition = false;
        config.form[0].items[2].helpvalue = "<div class='alert alert-" + resClass + "'>" +
          message.exit_code + " : " + String(response.data.exit_code) + "</div>";

        // for output
        config.form[0].items[3].condition = false;

        // display new dialog
        waitSpinner.hideModalSpinner();
        modal.open(config).then(submit);

        var result = actionResult.getActionResult().updated(resourceType, id);
        return result.results;
      }, function(response) {
        // close spinner and dispaly toast
        waitSpinner.hideModalSpinner();
        toast.add('error', response.data.split("(")[0].trim() + ".");
        var result = actionResult.getActionResult().failed(resourceType, id);
        return result.results;
      });
    }
  }
})();
