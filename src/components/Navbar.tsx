import { useEffect } from 'react';

import WalletModalBtn from './WalletModalBtn';

import * as React from 'react';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { useSession } from 'next-auth/react';
import { toJson } from '../utils/utils';
import { useStoreState } from '../utils/walletProvider';
//--------------------------------------
export default function Navbar() {

	const { data: session, status } = useSession()
	
	const [openUser, setOpenUser] = React.useState(false);
	const anchorRefUser = React.useRef<HTMLButtonElement>(null);

	const handleToggleUser = () => {
		setOpenUser((prevOpen) => !prevOpen);
	};

	const handleCloseUser = (event: Event | React.SyntheticEvent) => {
		if (
		anchorRefUser.current &&
		anchorRefUser.current.contains(event.target as HTMLElement)
		) {
		return;
		}

		setOpenUser(false);
	};

	function handleListKeyDownUser(event: React.KeyboardEvent) {
		if (event.key === 'Tab') {
			event.preventDefault();
			setOpenUser(false);
		} else if (event.key === 'Escape') {
			setOpenUser(false);
		}
	}

	// return focus to the button when we transitioned from !open -> open
	const prevOpenUser = React.useRef(openUser);
	
	useEffect(() => {
		if (prevOpenUser.current === true && openUser === false) {
			anchorRefUser.current!.focus();
		}

		prevOpenUser.current = openUser;
	}, [openUser]);

	const [openAdmin, setOpenAdmin] = React.useState(false);
	const anchorRefAdmin = React.useRef<HTMLButtonElement>(null);

	const handleToggleAdmin = () => {
		setOpenAdmin((prevOpen) => !prevOpen);
	};

	const handleCloseAdmin = (event: Event | React.SyntheticEvent) => {
		if (
		anchorRefAdmin.current &&
		anchorRefAdmin.current.contains(event.target as HTMLElement)
		) {
		return;
		}

		setOpenAdmin(false);
	};

	function handleListKeyDownAdmin(event: React.KeyboardEvent) {
		if (event.key === 'Tab') {
			event.preventDefault();
			setOpenAdmin(false);
		} else if (event.key === 'Escape') {
			setOpenAdmin(false);
		}
	}

	// return focus to the button when we transitioned from !open -> open
	const prevOpenAdmin = React.useRef(openAdmin);
	
	useEffect(() => {
		if (prevOpenAdmin.current === true && openAdmin === false) {
			anchorRefAdmin.current!.focus();
		}

		prevOpenAdmin.current = openAdmin;
	}, [openAdmin]);
	
	const walletStore = useStoreState(state => state.wallet)
	const { isWalletDataLoaded, swWalletIsAdminOfSomePool } = useStoreState(state => {
		return { isWalletDataLoaded: state.isWalletDataLoaded, swWalletIsAdminOfSomePool: state.swWalletIsAdminOfSomePool };
	});

	return (
		<div>
			<div className="header">
				
				<div className="navbar-section navbar-start">

					<Button
						className={openUser ? "navbar-menubutton navbar-menubutton-selected" : "navbar-menubutton"}
						ref={anchorRefUser}
						id="composition-button"
						aria-controls={openUser ? 'composition-menu' : undefined}
						aria-expanded={openUser ? 'true' : undefined}
						aria-haspopup="true"
						onClick={handleToggleUser}
						>
						Menu
					</Button>
					
					
					<Popper
						open={openUser}
						anchorEl={anchorRefUser.current}
						role={undefined}
						placement="bottom-start"
						transition
						disablePortal
						>
						{({ TransitionProps, placement }) => (
							<Grow
							{...TransitionProps}
							style={{
								transformOrigin:
								placement === 'bottom-start' ? 'left top' : 'left bottom',
							}}
							>
							<Paper
								className='navbar-menupaper'
							>
								<ClickAwayListener onClickAway={handleCloseUser}>
								<MenuList
									className='navbar-menubar'
									autoFocusItem={openUser}
									id="composition-menu"
									aria-labelledby="composition-button"
									onKeyDown={handleListKeyDownUser}
								>
									<div>
										<MenuItem className='navbar-menuitem' onClick={handleCloseUser}><a href="/">Stake</a></MenuItem>
										<MenuItem className='navbar-menuitem' onClick={handleCloseUser}><a href="/withdraw">My Deposits</a></MenuItem>
										<MenuItem className='navbar-menuitem' onClick={handleCloseUser}><a href="http://69.55.59.109:3080/withdraw">Legacy Stake</a></MenuItem>
									
									</div>
								</MenuList>
								</ClickAwayListener>
							</Paper>
							</Grow>
						)}
					</Popper>

					{true || session?.user.swRatsDAOCreator || session?.user.swPortalUploader || (walletStore.connected && isWalletDataLoaded && swWalletIsAdminOfSomePool) ?
						<>
						<Button
							className={openAdmin ? "navbar-menubutton navbar-menubutton-selected" : "navbar-menubutton"}
							ref={anchorRefAdmin}
							id="composition-button"
							aria-controls={openAdmin ? 'composition-menu' : undefined}
							aria-expanded={openAdmin ? 'true' : undefined}
							aria-haspopup="true"
							onClick={handleToggleAdmin}
							>
							Admin
						</Button>
						
						
						<Popper
							open={openAdmin}
							anchorEl={anchorRefAdmin.current}
							role={undefined}
							placement="bottom-start"
							transition
							disablePortal
							>
							{({ TransitionProps, placement }) => (
								<Grow
								{...TransitionProps}
								style={{
									transformOrigin:
									placement === 'bottom-start' ? 'left top' : 'left bottom',
								}}
								>
								<Paper
									className='navbar-menupaper'
								>
									<ClickAwayListener onClickAway={handleCloseAdmin}>
									<MenuList
										className='navbar-menubar'
										autoFocusItem={openAdmin}
										id="composition-menu"
										aria-labelledby="composition-button"
										onKeyDown={handleListKeyDownAdmin}
									>
										<div>
											{session?.user.swPortalAdmin || swWalletIsAdminOfSomePool?
												<>
													<MenuItem className='navbar-menuitem' onClick={handleCloseAdmin}><a href="/admin">Manage</a></MenuItem>
												</>
												: <><></></>
											}
											
											{session?.user.swRatsDAOCreator?
												<>
													<MenuItem className='navbar-menuitem' onClick={handleCloseAdmin}><a href="/create">Create</a></MenuItem>
												</>
												: <></>
											}

											<MenuItem className='navbar-menuitem' onClick={handleCloseAdmin}><a href="/request">Request</a></MenuItem>

											{session?.user.swPortalUploader?
												<>
													<MenuItem className='navbar-menuitem' onClick={handleCloseAdmin}><a href="/upload">Upload</a></MenuItem>
												</>
												: <></>
											}
											
											{session?.user.swPortalAdmin ?
												<>
													<MenuItem className='navbar-menuitem' onClick={handleCloseAdmin}><a href="/settings">Settings</a></MenuItem>
												</>
												: <></>
											}	
										</div>
									</MenuList>
									</ClickAwayListener>
								</Paper>
								</Grow>
							)}
						</Popper>

						</>:<></>
					}


					<Button
						className={"navbar-menubutton"}
						
						id="composition-button"
						
						onClick={() => {window.location.href="/faqs"}}
						>
						FAQs
					</Button>

				</div>

				<div className="navbar-section navbar-middle">
					<h1><a className="main" href="/" >
						{process.env.NEXT_PUBLIC_CLIENT_PORTAL_NAME}
					</a></h1>
				</div>
				<div className="navbar-section navbar-end">
					<WalletModalBtn />
				</div>
			</div>

			{/* <div>
				{"RatsDAOAdmin: " + session?.user.swRatsDAOAdmin}<br></br>
				{"RatsDAOCreate: " + session?.user.swRatsDAOCreator}<br></br>
				{"PortalAdmin: " + session?.user.swPortalAdmin}<br></br>
				{"PortalUploader: " + session?.user.swPortalUploader}<br></br>
				{"StakingAdmin: " + swWalletIsAdminOfSomePool}<br></br>
			</div> */}

		</div>
		
	)
}

