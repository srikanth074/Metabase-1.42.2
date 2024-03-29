import { restore, visitQuestion } from "__support__/e2e/cypress";

describe("scenarios > question > native subquery", () => {
  beforeEach(() => {
    restore();
    cy.signInAsAdmin();
  });

  it("should allow a user with no data access to execute a native subquery", () => {
    // Create the initial SQL question and followup nested question
    cy.createNativeQuestion({
      name: "People in WA",
      native: {
        query: "select * from PEOPLE where STATE = 'WA'",
      },
    })
      .then(response => {
        cy.wrap(response.body.id).as("nestedQuestionId");
        const tagID = `#${response.body.id}`;

        cy.createNativeQuestion({
          name: "Count of People in WA",
          native: {
            query: `select COUNT(*) from {{#${response.body.id}}}`,
            "template-tags": {
              [tagID]: {
                id: "10422a0f-292d-10a3-fd90-407cc9e3e20e",
                name: tagID,
                "display-name": tagID,
                type: "card",
                "card-id": response.body.id,
              },
            },
          },
        });
      })
      .then(response => {
        cy.wrap(response.body.id).as("toplevelQuestionId");

        visitQuestion(response.body.id);
        cy.contains("41");
      });

    // Now sign in as a user w/no data access
    cy.signIn("nodata");

    // They should be able to access both questions
    cy.get("@nestedQuestionId").then(nestedQuestionId => {
      visitQuestion(nestedQuestionId);
      cy.contains("Showing 41 rows");
    });

    cy.get("@toplevelQuestionId").then(toplevelQuestionId => {
      visitQuestion(toplevelQuestionId);
      cy.contains("41");
    });
  });
});
