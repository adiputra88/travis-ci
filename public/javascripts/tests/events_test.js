/*
   build:started
    - includes the full repository and build information
    - updates the repositories list, i.e. changes the last build information, and makes the repository list entry flash
    - updates the current repository view if the build belongs to this repository, i.e. changes the build summary and clears the build log
    - updates the repository's build history table if the build belongs to this repository, i.e. it prepends the build to the list

   build:log
    - only includes minimal information: repository id, build id and log characters that were appended to the build log
    - appends to the build log on repository and build views if they are displaying this build

   build:finished
    - includes the full repository and build information
    - updates the repositories list, i.e. changes the last build information, and stops the repository list entry flashing
    - updates the current repository view if the build belongs to this repository, i.e. changes the build summary
    - updates the repository's build history table if the build belongs to this repository, i.e. it updates the finished_at date
*/

var delay = 0;

describe('Events:', function() {
  var it_adds_the_repository_to_the_repositories_collection = function(delay) {
    it('adds the repository to the repositories collection', function() {
      runs_after(delay, function() {
        expect(Travis.app.repositories.last().get('name')).toEqual('svenfuchs/gem-release');
      });
    });
  };

  var it_prepends_the_repository_to_the_repositories_list = function(delay) {
    it('prepends the repository to the repositories list', function() {
      runs_after(delay, function() {
        expect_text('#repositories .repository:nth-of-type(1) a:nth-of-type(1)', this.data.repository.name)
      });
    });
  };

  var it_adds_the_build_to_the_repositorys_builds_collection = function(delay) {
    it("it adds the build to the repository's builds collection", function() {
      runs_after(delay, function() {
       expect(Travis.app.repositories.last().builds.models.length).toEqual(2);
      });
    });
  };

  var it_updates_the_repository_list_items_build_information = function(delay) {
    it('updates the build number of the repository list item', function() {
      runs_after(delay, function() {
        expect_text('#repositories #repository_' + this.data.repository.id + ' .build', '#' + this.data.repository.last_build.number);
      });
    });
  }

  var it_sets_the_repository_list_items_build_status_color = function(delay) {
    it('updates the build status color of the repository list item', function() {
      runs_after(delay, function() {
        var selector = '#repositories #repository_' + this.data.repository.id + '.';
        expect_element(selector + 'red,' + selector + 'green');
      });
    });
  };

  var it_resets_the_repository_list_items_build_status_color = function(delay) {
    it('updates the build status color of the repository list item', function() {
      runs_after(delay, function() {
        var selector = '#repositories #repository_' + this.data.repository.id + '.';
        expect_no_element(selector + 'red,' + selector + 'green');
      });
    });
  };

  var it_makes_the_repository_list_item_flash = function(delay) {
    it('makes the repository list item flash', function() {
      runs_after(delay, function() {
        expect_element('#repositories #repository_' + this.data.repository.id + ':animated');
      });
    });
  };

  var it_stops_the_repository_list_item_flashing = function(delay) {
    it('stops the repository list item flashing', function() {
      runs_after(delay, function() {
        expect_no_element('#repositories #repository_' + this.data.repository.id + ':animated');
      });
    });
  };

  var it_updates_the_build_summary = function(delay) {
    it('updates the build number of the repository build summary', function() {
      runs_after(delay, function() {
        expect_text('#main .summary .number', this.data.repository.last_build.number + '');
      });
    });
  };

  var it_does_not_update_the_build_summary = function(delay) {
    it('does not update the build number of the repository build summary', function() {
      runs_after(delay, function() {
        expect_text('#main .summary .number', INIT_DATA.repositories[1].last_build.number + '');
      });
    });
  };

  var it_appends_to_the_build_log = function(delay) {
    it('appends to the build log', function() {
      runs_after(delay, function() {
        expect_text('#main .log', this.repository.last_build.log + this.data.append_log)
      });
    });
  };

  var it_does_not_append_to_the_build_log = function(delay) {
    it('does not append to the build log', function() {
      runs_after(delay, function() {
        expect_text('#main .log', INIT_DATA.repositories[1].last_build.log)
      });
    });
  };

  var it_prepends_the_build_to_the_builds_history_table = function(delay) {
    it('prepends the build to the builds history table', function() {
      runs_after(delay, function() {
        expect_text('#main #builds tr:nth-child(2) td.number', '#' + this.data.number)
      });
    });
  };

  var it_does_not_prepend_the_build_to_the_builds_history_table = function(delay) {
    it('does not prepend the build to the builds history table', function() {
      runs_after(delay, function() {
        expect_text('#main #builds tr:nth-child(2) td.number', '#' + this.repository.last_build.number)
      });
    });
  }

  var it_updates_the_builds_history_table_row = function(delay) {
    it('updates the builds history table row', function() {
      runs_after(400, function() {
        expect_text('#main #builds tr:nth-child(2) td.finished_at', this.data.finished_at)
      });
    });
  };

  var it_does_not_update_the_builds_history_table_row = function(delay) {
    it('does not update the builds history table row', function() {
      runs_after(400, function() {
        expect_text('#main #builds tr:nth-child(2) td.finished_at', this.repository.last_build.finished_at)
      });
    });
  }


  describe('on the repository view', function() {
    beforeEach(function() {
      this.repository = INIT_DATA.repositories[1];
      go_to('#!/' + this.repository.name)
    });

    describe('an incoming event for a new repository', function() {
      describe('build:started', function() {
        beforeEach(function() {
          this.data = new_repository_data();
          Travis.app.trigger('build:started', this.data);
        });

        it_adds_the_repository_to_the_repositories_collection();
        it_prepends_the_repository_to_the_repositories_list();
      });

      describe('build:finished', function() {
        beforeEach(function() {
          this.data = new_repository_data();
          Travis.app.trigger('build:finished', this.data);
        });

        it_prepends_the_repository_to_the_repositories_list();
      });
    });

    describe('an incoming event for the current repository', function() {
      beforeEach(function() {
      });

      describe('build:started', function() {
        beforeEach(function() {
          this.data = build_started_data(this.repository);
          Travis.app.trigger('build:started', this.data);
        });

        it_adds_the_build_to_the_repositorys_builds_collection();
        it_updates_the_repository_list_items_build_information();
        it_makes_the_repository_list_item_flash();
        it_updates_the_build_summary();
      });

      describe('build:log', function() {
        beforeEach(function() {
          this.data = build_log_data(this.repository, { append_log: ' foo!'});
          Travis.app.trigger('build:log', this.data);
        });

        it_appends_to_the_build_log();
      });

      describe('build:finished', function() {
        beforeEach(function() {
          this.data = build_finished_data(this.repository);
          Travis.app.trigger('build:finished', this.data);
        });

        it_updates_the_repository_list_items_build_information();
        it_sets_the_repository_list_items_build_status_color();
        it_stops_the_repository_list_item_flashing();
        it_updates_the_build_summary();
      });
    });

    describe('an incoming event for a different repository', function() {
      describe('build:started', function() {
        beforeEach(function() {
          this.data = _.extend(build_started_data(INIT_DATA.repositories[0]), { number: 4 });
          Travis.app.trigger('build:started', this.data);
        });

        it_updates_the_repository_list_items_build_information();
        it_makes_the_repository_list_item_flash();
        it_does_not_update_the_build_summary();
      });

      describe('build:log', function() {
        beforeEach(function() {
          this.data = build_log_data(INIT_DATA.repositories[0], { append_log: ' foo!'});
          Travis.app.trigger('build:log', this.data);
        });

        it_does_not_append_to_the_build_log();
      });

      describe('build:finished', function() {
        beforeEach(function() {
          this.data = build_finished_data(INIT_DATA.repositories[0]);
          Travis.app.trigger('build:finished', this.data);
        });

        it_updates_the_repository_list_items_build_information();
        it_sets_the_repository_list_items_build_status_color();
        it_stops_the_repository_list_item_flashing();
        it_does_not_update_the_build_summary();
      });
    });
  });

  describe('on the build view', function() {
    beforeEach(function() {
      this.repository = INIT_DATA.repositories[1];
      go_to('#!/' + this.repository.name + '/builds/' + this.repository.last_build.id)
    });

    describe('an incoming event for the current build', function() {
      describe('build:log', function() {
        beforeEach(function() {
          runs_after(delay, function() {
            this.data = build_log_data(this.repository, { append_log: ' foo!'});
            Travis.app.trigger('build:log', this.data);
          });
        });

        it_appends_to_the_build_log();
      });

      describe('build:finished', function() {
        beforeEach(function() {
          runs_after(delay, function() {
            this.data = _.extend(build_finished_data(this.repository), { finished_at: '2010-11-11T12:01:30Z' });
            Travis.app.trigger('build:finished', this.data);
          });
        });

        it_updates_the_repository_list_items_build_information();
        it_sets_the_repository_list_items_build_status_color();
        it_stops_the_repository_list_item_flashing();
        it_updates_the_build_summary();
      });
    });

    describe('an incoming event for a different build', function() {
      describe('build:log', function() {
        beforeEach(function() {
          runs_after(delay, function() {
            this.data = build_log_data(INIT_DATA.repositories[0], { append_log: ' foo!'});
            Travis.app.trigger('build:log', this.data);
          });
        });

        it_does_not_append_to_the_build_log();
      });

      describe('build:finished', function() {
        beforeEach(function() {
          runs_after(delay, function() {
            this.data = build_finished_data(INIT_DATA.repositories[0]);
            Travis.app.trigger('build:finished', this.data);
          });
        });

        it_updates_the_repository_list_items_build_information();
        it_sets_the_repository_list_items_build_status_color();
        it_stops_the_repository_list_item_flashing();
        it_does_not_update_the_build_summary();
      });
    });
  });

  describe('on the build history view', function() {
    beforeEach(function() {
      this.repository = INIT_DATA.repositories[1];
      go_to('#!/' + this.repository.name + '/builds')
    });

    describe('an incoming event for the current build', function() {
      describe('build:started', function() {
        beforeEach(function() {
          runs_after(200, function() {
            this.data = _.extend(build_started_data(this.repository), { number: 4 });
            Travis.app.trigger('build:started', this.data);
          });
        });

        it_prepends_the_build_to_the_builds_history_table(200);
      });

      describe('build:finished', function() {
        beforeEach(function() {
          runs_after(delay, function() {
            this.data = _.extend(build_finished_data(this.repository), { finished_at: '2010-11-11T12:01:30Z' });
            Travis.app.trigger('build:finished', this.data);
          });
        });

        it_updates_the_builds_history_table_row(delay);
      });
    });

    describe('an incoming event for a different build', function() {
      describe('build:started', function() {
        beforeEach(function() {
          runs_after(200, function() {
            this.data = _.extend(build_started_data(INIT_DATA.repositories[0]), { number: 4 });
            Travis.app.trigger('build:started', this.data);
          });
        });

        it_does_not_prepend_the_build_to_the_builds_history_table(200);
      });

      describe('build:finished', function() {
        beforeEach(function() {
          runs_after(delay, function() {
            this.data = _.extend(build_finished_data(INIT_DATA.repositories[0]), { finished_at: '2010-11-11T12:01:30Z' });
            Travis.app.trigger('build:finished', this.data);
          });
        });

        it_does_not_update_the_builds_history_table_row(delay);
      });
    });
  });
});
