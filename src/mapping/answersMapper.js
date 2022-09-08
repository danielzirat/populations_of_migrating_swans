const getRelativeString = require("../mapping/converters").getRelativeString;

exports.toDiskAnswers = (domainAnswers) => {
    let diskAnswers = {};
    domainAnswers.forEach(domainAnswer => {
        diskAnswers = {...diskAnswers, ...this.toDiskAnswer(domainAnswer)}
    });
    return diskAnswers;
}

exports.toDiskAnswer = (domainAnswer) => {
    let diskAnswer = {};
    diskAnswer[domainAnswer.Id] = {
        OwnerUserId: domainAnswer.OwnerUserId,
        CreationDate: domainAnswer.CreationDate,
        ParentId: domainAnswer.ParentId,
        Score: domainAnswer.Score,
        Body: domainAnswer.Body,
        LikedByUsers: domainAnswer.LikedByUsers
    }
    return diskAnswer;
}

exports.toDomainAnswer = (key, diskAnswer) => {
    let creationDate = Date.parse(diskAnswer["CreationDate"]);
    let relativeCreationDate = getRelativeString(Date.now(), creationDate);
    return {
        Id: key,
        OwnerUserId: diskAnswer.OwnerUserId,
        CreationDate: diskAnswer.CreationDate,
        RelativeCreationDate: relativeCreationDate,
        ParentId: diskAnswer.ParentId,
        Score: diskAnswer.Score,
        Body: diskAnswer.Body,
        LikedByUsers: diskAnswer.LikedByUsers
    }
}

exports.toDomainAnswers = (diskAnswers) => {
    let domainAnswers = [];
    for (let entry in diskAnswers) {
        domainAnswers.push(this.toDomainAnswer(entry, diskAnswers[entry]));
    }
    return domainAnswers;
}