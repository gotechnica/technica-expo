import React, { Component } from 'react';
import axiosRequest from 'Backend.js';

import CreateChallengeModal from 'admin/CreateChallengeModal';
import CreateProjectModal from 'admin/CreateProjectModal';
import CreateSponsorModal from 'admin/CreateSponsorModal';
import EditChallengeModal from 'admin/EditChallengeModal';
import EditProjectModal from 'admin/EditProjectModal';
import EditSponsorModal from 'admin/EditSponsorModal';
import WarningModal from 'admin/WarningModal';
import SubmitInputModal from 'components/SubmitInputModal';

import 'Admin.css';
import 'App.css';
import { sortByTableNumber } from 'helpers.js';
import WinnerBadge from 'customize/imgs/winner_ribbon.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SiteWrapper from 'SiteWrapper.js';
import SmallerParentheses from 'SmallerParentheses.js';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faSquare } from '@fortawesome/fontawesome-free-regular';
import { faCaretDown, faCaretUp, faCheckSquare, faUpload } from '@fortawesome/fontawesome-free-solid';
library.add(faUpload);
library.add(faCaretDown);
library.add(faCaretUp);
library.add(faCheckSquare);
library.add(faSquare);


/* Admin page content (see PRD)  */

/* Project panel of admin page */

class ProjectModule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textSearch: '',
      projectIndexToEdit: -1,
      uploadStatus: '',
      projectsCSV: '',
      tableAssignmentStatus: '',
      tableAssignmentSchema: '',
      tableStartLetter: '',
      tableStartNumber: 0,
      tableEndLetter: '',
      tableEndNumber: 0,
      skipEveryOtherTable: true,
      viewable: true,
    };
  }

  createChallengesToCompanyMap(challenges_obj) {
    const allChallengesMapping = {};
    for (let company in challenges_obj) {
      challenges_obj[company].forEach(function(challenge){
        allChallengesMapping[challenge] = company;
      })

    }
    return allChallengesMapping;
  }

  createAllChallenges(obj) {
    let allChallenges = [];
    for (let key in obj) {
      obj[key].forEach(function(item){
        if (allChallenges.indexOf(item) === -1) {
          allChallenges.push(item);
        }
      })
    }
    allChallenges.sort();
    // obj.map((item)=>{
    //   item.challenges.map((challenge)=>{
    //     if(allChallenges.indexOf(challenge)===-1)
    //       allChallenges.push(challenge);
    //   })
    // })
    return allChallenges;
  }

  sortData() {
    let data = this.props.projects;
    let finalProjectsData = [];

    data.forEach(function(obj){
      let challenge = [];
      obj.challenges.forEach(function(item){
        challenge.push(item.challenge_name);
      })
      finalProjectsData.push(
        {
          project_id: obj.project_id,
          project_name: obj.project_name,
          table_number: obj.table_number,
          url: obj.project_url,
          challenges: challenge,
          company_challenge: obj.challenges
        }
      )

    })
    return finalProjectsData;
  }

  onUploadCSVSubmitForm(e) {
    e.preventDefault();

    const data = new FormData();
    data.append('projects_csv', this.projects_csv.files[0]);

    if (this.projects_csv.files[0] == null) {
      this.setState({
        uploadStatus: 'Please select a file before hitting upload!'
      });
    } else {
      axiosRequest.post('parse_csv', data)
        .then((response) => {
          this.projects_csv.value = ''; // Clear input field
          this.setState({ // Flash success message and clear input display
            uploadStatus: response.data,
            projectsCSV: ''
          });
          this.props.loadProjects();
        })
        .catch((error) => {
          this.setState({ // Flash error message
            uploadStatus: 'Oops! Something went wrong...'
          });
        });
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  onAutoAssignTableNumbers(e) {
    e.preventDefault();
    if (this.state.tableAssignmentSchema === '') {
      this.setState({
        tableAssignmentStatus: 'Please first select a schema for assigning table numbers.',
      });
      return;
    }
    this.setState({
      tableAssignmentStatus: 'Processing your request to assign table numbers...',
    });
    axiosRequest.post(
      'api/projects/assign_tables',
      {
        table_assignment_schema: this.state.tableAssignmentSchema,
        table_start_letter: this.state.tableStartLetter,
        table_start_number: parseInt(this.state.tableStartNumber,10),
        table_end_letter: this.state.tableEndLetter,
        table_end_number: parseInt(this.state.tableEndNumber,10),
        skip_every_other_table: this.state.skipEveryOtherTable,
      }
    )
      .then((data) => {
        this.setState({ // Flash success message
          tableAssignmentStatus: data,
          tableAssignmentSchema: '',
          tableStartLetter: '',
          tableStartNumber: 0,
          tableEndLetter: '',
          tableEndNumber: 0,
          skipEveryOtherTable: true,
        });
        this.props.loadProjects();
      })
      .catch((error) => {
        this.setState({ // Flash error message
          tableAssignmentStatus: 'Oops! Something went wrong...'
        });
      });
  }

  onRemoveAllTableAssignments(e) {
    e.preventDefault();
    if (window.confirm('Are you sure you want to remove ALL table assignments from your database?')) {
      this.setState({
        tableAssignmentStatus: 'Processing your request to remove table assignments...',
      });
      axiosRequest.post('api/projects/clear_table_assignments')
        .then((data) => {
          this.setState({ // Flash success message
            tableAssignmentStatus: data,
          });
          this.props.loadProjects();
        })
        .catch((error) => {
          this.setState({ // Flash error message
            tableAssignmentStatus: 'Oops! Something went wrong...'
          });
        });
    }
  }

  deleteAllProjects() {
    if (window.confirm('Are you sure you want to remove ALL projects from your database?'))
      if (window.confirm('This action is not reversable.'))
        axiosRequest.delete('api/projects/deleteAll')
          .then(() => {
            this.props.loadProjects();
          });
  }

  renderEditProjectModal = (elt, index, allChallenges, challengesToCompanyMap) => {
    return (
      <EditProjectModal
        index={index}
        editID={"modalEditProject" + index.toString()}
        projectID={elt.project_id}
        project_name={elt.project_name}
        project_table={elt.table_number}
        url={elt.url}
        challenges={elt.challenges}
        toggle={elt.checkVal}
        allChallenges={allChallenges}
        company_map={challengesToCompanyMap}
        onEdit={this.props.loadProjects}
      />
    );
  }

  toggleView() {
    if (this.state.viewable) {
      this.setState({
        viewable: false
      });
      document.getElementById("project-content").style.display = "none";
    } else {
      this.setState({
        viewable: true
      });
      document.getElementById("project-content").style.display = "block";
    }
  }

  render() {
    let filteredProjects = this.sortData();
    let allChallenges = this.createAllChallenges(this.props.challenges);
    let challengesToCompanyMap = this.createChallengesToCompanyMap(this.props.challenges);
    if (this.state.textSearch !== '' && this.state.textSearch !== undefined) {
      filteredProjects = filteredProjects.filter(elt => {
        const upperCaseTextSearch = this.state.textSearch.toUpperCase();
        return elt.project_name.toUpperCase().includes(upperCaseTextSearch) ||
          elt.table_number.toUpperCase().includes(upperCaseTextSearch);
      });
    }

    return (
      <div className="card">
        <div className="card-header">
          <div className="d-flex">
            <h4>Projects</h4>
            <span className="ml-auto">
              <button className="link-button"
                type="button"
                onClick={() => { this.toggleView() }}>
                {!this.state.viewable ? "Show" : "Hide"}
              </button>
            </span>
          </div>
        </div>

        <div className="card-body" id="project-content">
          <h5>Seed Database</h5>
          <form
            method="post"
            encType="multipart/form-data"
            onSubmit={this.onUploadCSVSubmitForm.bind(this)}
          >
            <div className="form-group">
              <label>Upload Devpost CSV for parsing</label><br />
              <div className="upload-btn-wrapper">
                <button className="button button-primary font-weight-normal m-r-m"><FontAwesomeIcon icon="upload" className="upload_icon"></FontAwesomeIcon>Choose a file</button>
                <input type="file" id="file" name="projectsCSV" onChange={this.handleInputChange.bind(this)} ref={(ref) => { this.projects_csv = ref; }} />
                {this.state.projectsCSV.replace("C:\\fakepath\\", "")}
              </div>
            </div>
            <button className="button button-primary" type="submit">Upload</button>
            {this.state.uploadStatus !== '' &&
              <div className="row col" style={{ 'padding-top': '1rem' }}>
                <i>{this.state.uploadStatus}</i>
              </div>
            }
          </form>

          <br />
          <br />

          <h5>Auto Assign Table Numbers</h5>
          <form
            method="post"
            onSubmit={this.onAutoAssignTableNumbers.bind(this)}
          >
            <div onChange={this.handleInputChange.bind(this)} className="m-b-m">
              <div><input type="radio" name="tableAssignmentSchema" value="numeric" checked={this.state.tableAssignmentSchema === "numeric"} /> Numeric (1, 2, 3...)</div>
              <div><input type="radio" name="tableAssignmentSchema" value="odds" checked={this.state.tableAssignmentSchema === "odds"} /> Odds (1, 3, 5...)</div>
              <div><input type="radio" name="tableAssignmentSchema" value="evens" checked={this.state.tableAssignmentSchema === "evens"} /> Evens (2, 4, 6...)</div>
              <div><input type="radio" name="tableAssignmentSchema" value="custom" checked={this.state.tableAssignmentSchema === "custom"} /> Custom</div>
            </div>
            {this.state.tableAssignmentSchema === "custom" &&
              <div className="m-b-m">
                <p>Enter the starting and ending/maximum alphanumeric combinations (e.g. A1 to Z15).</p>
                <div className="form-group custom-table-assignment-container">
                  <input
                    type="text"
                    name="tableStartLetter"
                    className="form-control custom-table-assignment-child"
                    placeholder="ex: A"
                    onChange={this.handleInputChange.bind(this)}
                  />
                  <input
                    type="number"
                    name="tableStartNumber"
                    className="form-control custom-table-assignment-child"
                    placeholder="ex: 1"
                    onChange={this.handleInputChange.bind(this)}
                  />
                  to
                <input
                    type="text"
                    name="tableEndLetter"
                    className="form-control custom-table-assignment-child"
                    placeholder="ex: Z"
                    onChange={this.handleInputChange.bind(this)}
                  />
                  <input
                    type="number"
                    name="tableEndNumber"
                    className="form-control custom-table-assignment-child"
                    placeholder="ex: 15"
                    onChange={this.handleInputChange.bind(this)}
                  />
                </div>
                <input
                  name="skipEveryOtherTable"
                  type="checkbox"
                  checked={this.state.skipEveryOtherTable}
                  onChange={this.handleInputChange.bind(this)}
                /> Skip every other table? (Provides more spacious expo)
            </div>}
            <button type="submit" className="button button-primary m-r-m assign_button1">
              Assign Tables
            </button>
            <button className="button button-warning assign_button2" onClick={this.onRemoveAllTableAssignments.bind(this)}>
              Remove All Table Assignments
            </button>
            {this.state.tableAssignmentStatus !== '' &&
              <div className="row col" style={{ 'padding-top': '1rem' }}>
                <i>{this.state.tableAssignmentStatus}</i>
              </div>
            }
          </form>

          <br />
          <br />

          <h5>Projects <SmallerParentheses font_size="15px">{filteredProjects.length}</SmallerParentheses></h5>
          <CreateProjectModal
            createID="modalCreateProject"
            onCreate={this.props.loadProjects}
            allChallenges={allChallenges}
            company_map={challengesToCompanyMap}
          />
          <button className="button button-primary m-r-m m-b-m"
            type="button"
            data-toggle="modal"
            data-target="#modalCreateProject"
          >
            Create New Project
          </button>
          <button
            className="button button-warning m-b-m"
            type="button"
            data-toggle="modal"
            data-target="#projectWipeWarningModal"
          >
            Delete ALL Projects
          </button>
          <WarningModal modalId="projectWipeWarningModal" whatToDelete="Projects" deleteAll={this.deleteAllProjects.bind(this)} />
          <div className="form-group">
            <input type="text"
              id="txtProjectSearch"
              className="form-control"
              placeholder="Search for a project name..."
              onChange={(event) => this.setState({ textSearch: event.target.value })}
            />
          </div>
          <div className="row m-b-m">
            <h6 className="col grow-5">Project</h6>
            <h6 className="col">Table</h6>
            <div className="col" />
          </div>
          {filteredProjects.map((elt, index) => {
            return (
              <div className="row m-b-m" key={index} id={`project-${elt.project_id}`}>
                <div className="col grow-5 break-word">
                  {elt.project_name}
                </div>
                <div className="col">
                  {elt.table_number}
                </div>
                <div className="col">
                  <button
                    className="link-button"
                    id={`editProject${index.toString()}Btn`}
                    type="button"
                    data-toggle="modal"
                    data-target={"#modalEditProject" + index.toString()}
                    // Hacky solution to only mount the modal when necessary
                    // (helps if huge amount of projects in DB)
                    onMouseOver={() => {
                      this.setState({ projectIndexToEdit: index });
                    }}
                  >
                    Edit
                  </button>
                </div>
                {this.state.projectIndexToEdit === index ?
                  this.renderEditProjectModal(elt, index, allChallenges, challengesToCompanyMap) :
                  null
                }
              </div>
            )
          })}
        </div>
      </div>
    );
  }
}

/* Sponsor side of admin page */
class SponsorModule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textSearch: '',
      sponsors: [],
      viewable: true
    };
  }

  loadCompanies() {
    axiosRequest.get('api/companies')
      .then((sponsors) => {
        this.setState({
          sponsors: sponsors
        })
      });
  }

  toggleView() {
    if (this.state.viewable) {
      this.setState({
        viewable: false
      });
      document.getElementById("sponsor-content").style.display = "none";
    } else {
      this.setState({
        viewable: true
      });
      document.getElementById("sponsor-content").style.display = "block";
    }
  }

  deleteAllSponsors() {
    if (window.confirm('Are you sure you want to remove ALL sponsors from your database?'))
      if (window.confirm('This action is not reversable.'))
        axiosRequest.delete('api/companies/deleteAll')
          .then(() => {
            this.loadCompanies();
          });
  }

  seedChallengesFromDevpost(devpostUrl) {
    // Determine inputted URL or default server Devpost URL
    const params = devpostUrl === '' ? {} : { 'devpostUrl': devpostUrl };
    axiosRequest.post('api/seed-challenges-from-devpost', params)
      .then(() => {
        this.loadCompanies();
      });
  }

  // Pull data for sponsor list
  componentWillMount() {
    this.loadCompanies();
  }

  render() {
    // Compress list by access_code to suit view
    let compressedSponsors = [];
    this.state.sponsors.forEach(elt => {
      // Check whether code is unique
      let codeSeen = false;
      compressedSponsors.forEach((sponsor) => {
        if (sponsor.access_code === elt.access_code) {
          codeSeen = true;
        }
      });

      if (codeSeen === false) {
        // Set new item
        compressedSponsors.push(
          {
            access_code: elt.access_code,
            company_name: elt.company_name,
            challenges: [],
            id: elt.company_id
          }
        );
      }

      // Add challenge to corresponding sponsor
      let current_sponsor = null;
      compressedSponsors.forEach((sponsor) => {
        if (sponsor.access_code === elt.access_code) {
          current_sponsor = sponsor;
        }
      });
      if (elt.challenge_name !== undefined) {
        current_sponsor.challenges.push({
          challenge: elt.challenge_name,
          id: elt.challenge_id,
          num_winners: elt.num_winners
        });
      }

    });

    // Prepare sponsor list against filter (including sponsor name and challenges)
    let filteredSponsors = compressedSponsors;
    if (this.state.textSearch !== '' && this.state.textSearch !== undefined) {
      filteredSponsors = filteredSponsors.filter(elt => {

        let casedTextSearch = this.state.textSearch.toUpperCase()

        let chalSearch = false;
        elt.challenges.forEach(chal => {
          if (chal.challenge.toUpperCase().includes(casedTextSearch)) {
            chalSearch = true;
          }
        });
        return elt.company_name.toUpperCase().includes(casedTextSearch)
          || chalSearch;
      });
    }

    // Sort Sponsors
    filteredSponsors.sort((s1, s2) => {
      return (s1.company_name).localeCompare(s2.company_name);
    });

    return (
      <div className="card">
        <div className="card-header">
          <div className="d-flex">
            <h4>Sponsors ({this.state.sponsors.length})</h4>
            <span className="ml-auto">
              <button className="link-button"
                type="button"
                onClick={() => { this.toggleView() }}>
                {!this.state.viewable ? "Show" : "Hide"}
              </button>
            </span>
          </div>
        </div>
        <div className="card-body" id="sponsor-content">
          <CreateSponsorModal
            createID="modalCreateSponsor"
            onCreate={this.loadCompanies.bind(this)}
          />
          <button className="button button-primary m-b-m m-r-m"
            type="button"
            data-toggle="modal"
            data-target="#modalCreateSponsor"
          >
            Create New Sponsor
          </button>
          <button className="button button-warning m-b-m"
            type="button"
            data-toggle="modal"
            data-target="#companyWipeWarningModal"
          >
            Delete ALL Sponsors
          </button>
          <WarningModal modalId="companyWipeWarningModal" whatToDelete="Sponsors" deleteAll={this.deleteAllSponsors.bind(this)} />
          <button className="button button-primary m-b-m"
            type="button"
            data-toggle="modal"
            data-target="#seed-devpost-challenges"
          >
            Seed Sponsors/Challenges from Devpost
          </button>
          <SubmitInputModal
            modalId="seed-devpost-challenges"
            modalTitle="Seed Sponsors and Challenges from Devpost"
            bodyText="Give us your hackathon's Devpost link (with the https) and we'll seed your Expo App
              with all of your sponsors and challenges! Make sure you're following our Devpost naming guidelines
              (Ex: challenge_name - company_name)."
            inputLabel="Devpost Link"
            inputPlaceholder="https://bitcamp2019.devpost.com"
            isInputRequired={true}
            completeAction={(devpostUrl) => this.seedChallengesFromDevpost(devpostUrl)}
            submitText="Seed from Devpost"
          />
          <div className="form-group">
            <input type="text"
              id="txtSponsorSearch"
              className="form-control"
              placeholder="Search for a sponsor or challenge name..."
              onChange={(event) => this.setState({ textSearch: event.target.value })}
            />
          </div>
          {filteredSponsors.map((elt, key) => {
            return (
              <div className="sponsor-card" key={key}>
                <div>
                  <div className="d-flex">
                    <h5>
                      {elt.company_name}
                    </h5>
                    <span className="ml-auto">
                      <EditSponsorModal
                        editID={"modalEditSponsor" + key.toString()}
                        sponsorCode={elt.access_code}
                        sponsorName={elt.company_name}
                        sponsorID={elt.id}
                        onEdit={this.loadCompanies.bind(this)}
                      />
                      <button className="link-button"
                        type="button"
                        data-toggle="modal"
                        data-target={"#modalEditSponsor" + key.toString()}
                      >
                        Edit Details
                        </button>
                    </span>
                  </div>

                  <div>
                    <CreateChallengeModal
                      createID={"modalCreateChallenge" + key.toString()}
                      company={elt.company_name}
                      sponsorID={elt.id}
                      onCreate={this.loadCompanies.bind(this)}
                    />
                    <button
                      className="link-button shrink-0"
                      type="button"
                      data-toggle="modal"
                      data-target={"#modalCreateChallenge" + key.toString()}
                    >
                      Create Challenge
                          </button>
                  </div>

                  {elt.challenges.map((challenge, i) => {
                    return (
                      <div>
                        {(i + 1).toString() + ") " + challenge.challenge + " "}
                        <EditChallengeModal
                          editID={"modalEditChallenge" + elt.access_code.toString() + i.toString()}
                          challengeTitle={challenge.challenge}
                          numWinners={challenge.num_winners}
                          challengeID={challenge.id}
                          sponsorID={elt.id}
                          onEdit={this.loadCompanies.bind(this)}
                        />
                        <button className="link-button"
                          type="button"
                          data-toggle="modal"
                          data-target={"#modalEditChallenge" + elt.access_code.toString() + i.toString()}
                        >
                          Edit
                          </button>
                      </div>
                    )
                  })}
                </div>
                <hr />
              </div>
            )
          })}
        </div>
      </div>
    );
  }
}

class WinnerModule extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showPreview: false,
      data: [],
      expoIsPublished: false,
      winnersRevealed: false,
      missingWinners: []
    }
  }

  componentWillMount() {
    axiosRequest.get('api/is_published_status')
      .then((status) => {
        this.setState({
          expoIsPublished: status === "True"
        })
      });
    axiosRequest.get('api/publish_winners_status')
      .then((status) => {
        this.setState({
          winnersRevealed: status === "True"
        })
      });
  }

  loadWinners() {
    // toggle based on state

    // Pull data, add to state, and show
    axiosRequest.get('api/companies')
      .then((sponsors) => {
        let projects = this.props.projects.filter(elt => {
          return elt.challenges_won !== undefined
            && elt.challenges_won.length > 0;
        });

        //Build sponsor - challenge - winners struct
        let data = sponsors.filter(elt => {
          return elt.challenge_name !== undefined
            && elt.winners !== undefined && elt.winners.length > 0;
        }).map(elt => {

          // elt.winners => winner IDs
          // for each project, if proj.challenges_won contains elt.challenge_id
          // add proj.project_name to winners
          let winners = [];
          for (let i = 0; i < projects.length; i++) {
            if (projects[i].challenges_won.includes(elt.challenge_id)) {
              winners.push(projects[i].project_name);
            }
          }

          return {
            sponsor: elt.company_name,
            challenge: elt.challenge_name,
            winners: winners
          }
        });

        // Build list of sponsor - challenges without winners
        let missingWinners = sponsors.filter(elt => {
          return elt.challenge_name !== undefined
            && elt.winners.length === 0;
        }).map(elt => {
          return {
            sponsor: elt.company_name,
            challenge: elt.challenge_name
          }
        });

        /*this.setState({
          data: data.sort((s1, s2) => {
            if(s1.sponsor_name == undefined || s1.sponsor_name == undefined) {
              return 0;
            }

            return (s1.sponsor_name).localeCompare(s2.sponsor_name); })
        });*/

        this.setState({
          data: data.sort((s1, s2) => {
            if (s1.sponsor === undefined || s1.sponsor === undefined) {
              return 0;
            }
            return (s1.sponsor).localeCompare(s2.sponsor);
          }),
          missingWinnerData: missingWinners.sort((s1, s2) => {
            if (s1.sponsor === undefined || s1.sponsor === undefined) {
              return 0;
            }
            return (s1.sponsor).localeCompare(s2.sponsor);
          })
        });


      });
  }

  toggleWinnerPreview() {
    if (this.state.showPreview) {
      this.setState({
        showPreview: false
      });
    } else {
      // Get a data dump
      // sponsor - challenge - winner project names
      this.loadWinners();
      this.setState({
        showPreview: true
      });
    }
  }

  publishExpo() {
    axiosRequest.post('api/is_published_status', {
      "is_published": true
    }).then((data) => {
      this.setState({
        expoIsPublished: true
      });
    });
  }

  unpublishExpo() {
    axiosRequest.post('api/is_published_status', {
      "is_published": false
    }).then((data) => {
      this.setState({
        expoIsPublished: false
      });
    });
  }

  showWinners() {
    axiosRequest.post('api/publish_winners_status', {
      "publish_winners": true
    }).then((data) => {
      this.setState({
        winnersRevealed: true
      });
    });
  }

  hideWinners() {
    axiosRequest.post('api/publish_winners_status', {
      "publish_winners": false
    }).then((data) => {
      this.setState({
        winnersRevealed: false
      });
    });
  }

  render() {

    let caret = this.state.showPreview ?
      <FontAwesomeIcon icon={faCaretUp} className="fa-caret-up"></FontAwesomeIcon>
      :
      <FontAwesomeIcon icon={faCaretDown} className="fa-caret-down"></FontAwesomeIcon>;

    return (
      <div className="card">
        <div className="card-header">
          <div className="d-flex">
            <div>
              <h4>Administration</h4>
            </div>
            <div className="ml-auto">
              <button
                type="button"
                className="link-button"
                onClick={this.props.logout}
              >
                Logout
                </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div>
            {this.state.expoIsPublished ?
              <button type="button" className="button button-secondary m-r-m m-b-m"
                onClick={() => { this.unpublishExpo() }}>
                Unpublish Expo
              </button>
              :
              <button type="button" className="button button-primary m-r-m m-b-m"
                onClick={() => { this.publishExpo() }}>
                Go Live!
              </button>
            }
            {this.state.winnersRevealed ?
              <button type="button" className="button button-secondary"
                onClick={() => { this.hideWinners() }}>
                Hide Public Winners
               </button>
              :
              <button type="button" className="button button-primary"
                onClick={() => { this.showWinners() }}>
                Reveal Public Winners
               </button>
            }
          </div>
          <br />
          <div>
            <button type="button" className="link-button" onClick={() => { this.toggleWinnerPreview() }}>
              {!this.state.showPreview ?
                "Preview Winners "
                :
                "Hide Winners "}
              {caret}
            </button>
          </div>
          <br />

          {
            this.state.showPreview ?
              <h5>
                <img src= {WinnerBadge} alt="Winner Badge" className="Ribbon" height="30px" width="30px" />
                NO WINNERS SUBMITTED
                <img src= {WinnerBadge} alt="Winner Badge"className="Ribbon" height="30px" width="30px" />
              </h5>
              : ""
          }

          {
            this.state.showPreview ?
              this.state.data.length === 0 ?
                "No winners have been selected"
                :
                this.state.missingWinnerData.map(elt => {
                  return (
                    <div>
                      {`[${elt.sponsor}] ${elt.challenge}`}
                      <br />
                      <br />
                    </div>
                  );
                })
              :
              ""
          }

          {
            this.state.showPreview ?
              <h5>
                <img src= {WinnerBadge} alt="Winner Badge" className="Ribbon" height="30px" width="30px" />
                SUBMITTED WINNERS
                <img src= {WinnerBadge} alt="Winner Badge" className="Ribbon" height="30px" width="30px" />
              </h5>
              : ""
          }


          {
            this.state.showPreview ?
              this.state.data.length === 0 ?
                "No winners have been selected"
                :
                this.state.data.map(elt => {
                  return (
                    <div>
                      {`[${elt.sponsor}] ${elt.challenge} - ${elt.winners.join(", ")}`}
                      <br />
                      <br />
                    </div>
                  );
                })
              :
              ""
          }

        </div>
      </div>
    );
  }

}

/* Final class containing admin page */
class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      loggedInAs: '',
      projects: [],
      challenges: ''
    };
    // LF6K3G6RR3Q4VX4S
    axiosRequest.get('api/whoami')
      .then((credentials) => {
        if (credentials !== undefined && credentials.user_type === 'admin') {
          this.setState({
            loggedIn: true,
            loggedInAs: 'admin'
          });
        } else {
          this.props.history.push({
            pathname: '/adminlogin'
          });
        }
      })
      .catch((error) => {

      });
  }

  componentWillMount() {
    this.loadProjects();
    this.loadChallenges();
  }

  loadProjects = () => {
    axiosRequest.get('api/projects_and_winners')
      .then((projectData) => {
        // Check first project element and see if table numbers consist of both alpha and numeric portions
        const tableNumbersAreOnlyNumeric = projectData['projects'].length > 0 &&
          /^[0-9]+$/.test(projectData['projects'][0]['table_number']);
        this.setState({
          projects: sortByTableNumber(projectData['projects'], !tableNumbersAreOnlyNumeric),
        });
      });
  }

  loadChallenges = () => {
    axiosRequest.get('api/challenges')
      .then((challengeData) => {
        this.setState({
          challenges: challengeData
        })
      })
  }

  logout() {
    // Redirect back to admin login page and end session
    axiosRequest.post('api/logout')
      .then(() => {
        this.props.history.push('/adminlogin');
      });
  }

  render() {
    if (this.state.loggedIn) {
      return (
        SiteWrapper(
          <div className="row">
            <div className="col">
              <WinnerModule projects={this.state.projects} loadProjects={this.loadProjects} logout={this.logout.bind(this)} />
              <SponsorModule />
            </div>
            <div className="col">
              <ProjectModule projects={this.state.projects} loadProjects={this.loadProjects} loadChallenges={this.loadChallenges} challenges={this.state.challenges} />
            </div>
          </div>
        )
      );
    } else {
      return SiteWrapper();
    }
  }
}

export default Admin;
