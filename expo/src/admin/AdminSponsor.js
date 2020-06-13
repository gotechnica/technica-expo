import React, { Component } from "react";
import axiosRequest from "Backend.js";
import Card from "components/Card.js";

import CreateChallengeModal from "admin/CreateChallengeModal";
import CreateSponsorModal from "admin/CreateSponsorModal";
import EditChallengeModal from "admin/EditChallengeModal";
import EditSponsorModal from "admin/EditSponsorModal";
import WarningModal from "admin/WarningModal";
import SubmitInputModal from "components/SubmitInputModal";

import "Admin.css";
import "App.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import {
  faCaretDown,
  faCaretUp,
  faCheckSquare,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
library.add(faUpload);
library.add(faCaretDown);
library.add(faCaretUp);
library.add(faCheckSquare);
library.add(faSquare);

/* Sponsor side of admin page */
class SponsorModule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textSearch: "",
      sponsors: [],
      viewable: true,
      sponsor_names: [],
    };
  }

  loadCompanies() {
    axiosRequest.get("api/companies").then((sponsors) => {
      this.setState({
        sponsors: sponsors, // this is the list of challenges
        sponsor_names: [...new Set(sponsors.map((x) => x["company_name"]))],
      });
    });
  }

  deleteAllSponsors() {
    if (
      window.confirm(
        "Are you sure you want to remove ALL sponsors from your database?"
      )
    ) {
      if (window.confirm("This action is not reversable.")) {
        axiosRequest.delete("api/companies/deleteAll").then(() => {
          this.loadCompanies();
        });
      }
    }
  }

  seedChallengesFromDevpost(devpostUrl) {
    // Determine inputted URL or default server Devpost URL
    const params = devpostUrl === "" ? {} : { devpostUrl: devpostUrl };
    axiosRequest.post("api/seed-challenges-from-devpost", params).then(() => {
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
    this.state.sponsors.forEach((elt) => {
      // Check whether code is unique
      let codeSeen = false;
      compressedSponsors.forEach((sponsor) => {
        if (sponsor.access_code === elt.access_code) {
          codeSeen = true;
        }
      });

      if (codeSeen === false) {
        // Set new item
        compressedSponsors.push({
          access_code: elt.access_code,
          company_name: elt.company_name,
          challenges: [],
          id: elt.company_id,
        });
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
          num_winners: elt.num_winners,
        });
      }
    });

    // Prepare sponsor list against filter (including sponsor name and challenges)
    let filteredSponsors = compressedSponsors;
    if (this.state.textSearch !== "" && this.state.textSearch !== undefined) {
      filteredSponsors = filteredSponsors.filter((elt) => {
        let casedTextSearch = this.state.textSearch.toUpperCase();

        let chalSearch = false;
        elt.challenges.forEach((chal) => {
          if (chal.challenge.toUpperCase().includes(casedTextSearch)) {
            chalSearch = true;
          }
        });
        return (
          elt.company_name.toUpperCase().includes(casedTextSearch) || chalSearch
        );
      });
    }

    // Sort Sponsors
    filteredSponsors.sort((s1, s2) => {
      return s1.company_name.localeCompare(s2.company_name);
    });

    const content = !this.state.viewable ? null : (
      <div className="card-body" id="sponsor-content">
        <CreateSponsorModal
          id="modalCreateSponsor"
          onCreate={this.loadCompanies.bind(this)}
        />
        <button
          className="button button-primary m-b-m m-r-m"
          type="button"
          data-toggle="modal"
          data-target="#modalCreateSponsor"
        >
          Create New Sponsor
        </button>
        <button
          className="button button-warning m-b-m"
          type="button"
          data-toggle="modal"
          data-target="#companyWipeWarningModal"
        >
          Delete ALL Sponsors
        </button>
        <WarningModal
          modalId="companyWipeWarningModal"
          collection="Sponsors"
          onDelete={this.deleteAllSponsors.bind(this)}
        />
        <button
          className="button button-primary m-b-m"
          type="button"
          data-toggle="modal"
          data-target="#seed-devpost-challenges"
        >
          Seed Sponsors/Challenges from Devpost
        </button>
        <SubmitInputModal
          id="seed-devpost-challenges"
          modalTitle="Seed Sponsors and Challenges from Devpost"
          bodyText="Give us your hackathon's Devpost link (with the https) and we'll seed your Expo App
                with all of your sponsors and challenges! Make sure you're following our Devpost naming guidelines
                (Ex: challenge_name - company_name)."
          inputLabel="Devpost Link"
          inputPlaceholder="https://bitcamp2019.devpost.com"
          isInputRequired={true}
          completeAction={(devpostUrl) =>
            this.seedChallengesFromDevpost(devpostUrl)
          }
          submitText="Seed from Devpost"
        />
        <div className="form-group">
          <input
            type="text"
            id="txtSponsorSearch"
            className="form-control"
            placeholder="Search for a sponsor or challenge name..."
            onChange={(event) =>
              this.setState({ textSearch: event.target.value })
            }
          />
        </div>
        {filteredSponsors.map((elt, key) => {
          return (
            <div className="sponsor-card" key={key}>
              <div>
                <div className="d-flex">
                  <h5>{elt.company_name}</h5>
                  <span className="ml-auto">
                    <EditSponsorModal
                      id={"modalEditSponsor" + key.toString()}
                      sponsorCode={elt.access_code}
                      sponsorName={elt.company_name}
                      sponsorID={elt.id}
                      onEdit={this.loadCompanies.bind(this)}
                    />
                    <button
                      className="link-button"
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
                    id={"modalCreateChallenge" + key.toString()}
                    key={
                      "modalCreateChallenge" +
                      key.toString() +
                      elt.challenges.length
                    }
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
                        id={
                          "modalEditChallenge" +
                          elt.access_code.toString() +
                          i.toString()
                        }
                        challengeTitle={challenge.challenge}
                        numWinners={challenge.num_winners}
                        challengeID={challenge.id}
                        sponsorID={elt.id}
                        onEdit={this.loadCompanies.bind(this)}
                      />
                      <button
                        className="link-button"
                        type="button"
                        data-toggle="modal"
                        data-target={
                          "#modalEditChallenge" +
                          elt.access_code.toString() +
                          i.toString()
                        }
                      >
                        Edit
                      </button>
                    </div>
                  );
                })}
              </div>
              <hr />
            </div>
          );
        })}
      </div>
    );

    return (
      <Card
        title={"Sponsors(" + this.state.sponsor_names.length + ")"}
        action={() => {
          this.setState({ viewable: !this.state.viewable });
        }}
        actionName={!this.state.viewable ? "Show" : "Hide"}
      >
        {content}
      </Card>
    );
  }
}

export default SponsorModule;
