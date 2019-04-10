import theme from './theme.style';

export const h1 = {
    fontSize: theme.fontSizeLarge,
    fontFamily: theme.assistantNorm,
    fontWeight: theme.fontWeightNorm,
}

export const h2 = {
    fontFamily: theme.assistantSB,
    fontWeight: theme.fontWeightSB,
    fontSize: theme.fontSizeMedium,
}

export const h3 = {
    fontFamily: theme.assistantNorm,
    fontWeight: theme.fontWeightNorm,
    fontSize: theme.fontSizeSmall,
}

export const primaryButton = {
    backgroundColor: theme.primaryColor,
    borderRadius: 23,
    paddingTop: 10,
    paddingBottom: 10,
}

export const secondaryButton = {
    backgroundColor: theme.secondaryColor,
    borderRadius: 23,
    paddingTop: 10,
    paddingBottom: 10,
}

export const buttonText = {
    fontFamily: theme.assistantSB,
    fontWeight: theme.fontWeightSB,
    fontSize: theme.fontSizeSmall,
}

export const link = {
    color: theme.primaryColor,
    fontFamily: theme.assistantSB,
    fontWeight: theme.fontWeightSB,
}

export const inputTextColor = {
    color: theme.lightGray,
}
