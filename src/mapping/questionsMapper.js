const getRelativeString = require("../mapping/converters").getRelativeString;

exports.toDiskQuestions = (domainQuestions) => {
    let diskQuestions = {};
    domainQuestions.forEach(domainQuestion => {
        diskQuestions[domainQuestion.Id] = {
            OwnerUserId: domainQuestion.OwnerUserId,
            CreationDate: domainQuestion.CreationDate,
            Score: domainQuestion.Score,
            Title: domainQuestion.Title,
            Body: domainQuestion.Body,
            LikedByUsers: domainQuestion.LikedByUsers
        }
    });
    return diskQuestions;
}

exports.toDiskQuestion = (domainQuestion) => {
    let diskQuestion = {};
    diskQuestion[domainQuestion.Id] = {
            OwnerUserId: domainQuestion.OwnerUserId,
            CreationDate: domainQuestion.CreationDate,
            Score: domainQuestion.Score,
            Title: domainQuestion.Title,
            Body: domainQuestion.Body,
            LikedByUsers: domainQuestion.LikedByUsers
        }
    return diskQuestion;
}

exports.toDomainQuestion = (key, diskQuestion) => {
    let creationDate = Date.parse(diskQuestion["CreationDate"]);
    let relativeCreationDate = getRelativeString(Date.now(), creationDate);
    return {
        Id: key,
        OwnerUserId: diskQuestion.OwnerUserId,
        CreationDate: diskQuestion.CreationDate,
        RelativeCreationDate: relativeCreationDate,
        Score: diskQuestion.Score,
        Title: diskQuestion.Title,
        Body: diskQuestion.Body,
        LikedByUsers: diskQuestion.LikedByUsers
    }
}

exports.toDomainQuestions = (diskQuestions) => {
    let domainQuestions = [];
    for (let entry in diskQuestions) {
        domainQuestions.push(this.toDomainQuestion(entry, diskQuestions[entry]));
    }
    return domainQuestions;
}