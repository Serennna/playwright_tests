const BasePage = require('../base_page');
const { BASE_URL_UI } = require('../../config/api_config');


class MyMeetingsPage extends BasePage {
    constructor(page, role) {
        super(page);
        this.url = `${BASE_URL_UI}/${role}/mentee/upcoming_meetings`;
        
        // Page elements selectors
        this.selectors = {
            // sidebar / navigation
            upcomingMeetingsLink: page.getByRole('link', { name: 'Upcoming Meetings' }),
            pastMeetingsLink: page.getByRole('link', { name: 'Past Meetings' }),

            // search
            searchInput: page.getByRole('textbox', { name: 'Search' }),
            startDateInput: page.getByRole('textbox', { name: 'Start Date' }),
            endDateInput: page.getByRole('textbox', { name: 'End Date' }),
            mentorSelection: page.locator('.ant-select-selection-wrap').first(),

            // table elements
            tableRows: page.locator('.ant-table-tbody tr'),
            tableCells: page.locator('.ant-table-tbody td'),
            tableMentorColumn: page.locator('.ant-table-tbody td:nth-child(2)'),
            tableDateColumn: page.locator('.ant-table-tbody td:nth-child(3)'),
            tableTimeColumn: page.locator('.ant-table-tbody td:nth-child(4)'),
            tableStatusColumn: page.locator('.ant-table-tbody td:nth-child(5)'),
            tableMeetingAgentColumn: page.locator('.ant-table-tbody td:nth-child(6)'),

          };
    }

    async switchToUpcomingMeetings() {
        await this.page.getByRole('link', { name: 'Upcoming Meetings' }).click();
    }


    
}

module.exports = MyMeetingsPage;