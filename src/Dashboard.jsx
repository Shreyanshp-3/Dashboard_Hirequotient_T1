import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table, Thead, Tbody, Tr, Th, Td, Button, Flex, Box, Input, InputGroup, InputLeftElement, InputRightElement,
    Tooltip, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { MdDelete, MdEdit, MdSave, MdClose, MdArrowLeft, MdArrowRight } from 'react-icons/md';
import './Dashboard.css';

const CustomAlert = ({ isOpen, onClose, message }) => {
    return (
        <AlertDialog isOpen={isOpen} onClose={onClose} isCentered>
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Alert
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        {message}
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button colorScheme="teal" onClick={onClose}>
                            OK
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
};

const Dashboard = () => {
    const [members, setMembers] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [editMode, setEditMode] = useState(null);
    const [editedData, setEditedData] = useState({});
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
                setMembers(response.data);
                setFilteredMembers(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);

    const handleNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const handleFirstPage = () => {
        setCurrentPage(1);
    };

    const handleLastPage = () => {
        setCurrentPage(totalPages);
    };

    const handleCheckboxChange = (memberId) => {
        setSelectedRows((prevSelectedRows) => {
            if (prevSelectedRows.includes(memberId)) {
                return prevSelectedRows.filter((id) => id !== memberId);
            } else {
                return [...prevSelectedRows, memberId];
            }
        });
    };

    const handleDelete = () => {
        if (selectedRows.length === 0) {
            setAlertMessage('Please select the row for confirming deletion.');
            setShowAlert(true);
            return;
        }

        setMembers((prevMembers) => prevMembers.filter((member) => !selectedRows.includes(member.id)));
        setFilteredMembers((prevFilteredMembers) => prevFilteredMembers.filter((member) => !selectedRows.includes(member.id)));
        setSelectedRows([]);
    };

    const handleEdit = (memberId) => {
        setEditMode(memberId);
    };

    const handleSave = (memberId) => {
        setMembers((prevMembers) =>
            prevMembers.map((member) =>
                member.id === memberId ? { ...member, ...editedData[memberId] } : member
            )
        );

        setFilteredMembers((prevFilteredMembers) =>
            prevFilteredMembers.map((member) =>
                member.id === memberId ? { ...member, ...editedData[memberId] } : member
            )
        );

        setEditMode(null);
        setEditedData((prevData) => ({ ...prevData, [memberId]: null }));
    };

    const handleCancelEdit = (memberId) => {
        setEditMode(null);
        setEditedData((prevData) => ({ ...prevData, [memberId]: null }));
    };

    const handleEditInputChange = (e, memberId, field) => {
        setEditedData((prevData) => ({
            ...prevData,
            [memberId]: {
                ...prevData[memberId],
                [field]: e.target.value,
            },
        }));
    };

    const handleSearch = () => {
        setFilteredMembers(
            members.filter((member) =>
                member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.role.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    };

    const handleSearchEnter = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <>
            <div style={{ position: 'relative', backgroundColor: '#f5f5f5', color: '#333', minHeight: '100vh', padding: '20px', fontFamily: 'Lato' }}>
                <Flex justifyContent="space-between" mb={3}>
                    <InputGroup mb={3} width="300px" borderColor="#ccc" borderWidth="1px" borderRadius="md">
                        <InputLeftElement pointerEvents="none" children={<Tooltip hasArrow label='Search places' bg='gray.300' color='black'>
                            <FiSearch />
                        </Tooltip>} />
                        <Input
                            placeholder="Search by name, email, or role"
                            value={searchTerm}
                            color="#333"
                            onChange={handleSearchChange}
                            onKeyPress={handleSearchEnter}
                            borderRadius="md"
                        />
                        <InputRightElement width="4rem">
                            <Button size="md" p="2" colorScheme='teal' variant='ghost' color=" #666666" onClick={handleSearch} borderRadius="md">
                                Search
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                    <Button
                        onClick={handleDelete}
                        m={1}
                        leftIcon={<MdDelete />}
                        colorScheme="red"
                        size="sm"
                        disabled={selectedRows.length === 0}
                    >
                        Delete Selected
                    </Button>
                </Flex>

                <Box border="1px solid #ccc" borderRadius="md" p={3} mb={3}>
                    <Table variant="simple" style={{ marginBottom: '30px' }}>
                        <Thead>
                            <Tr>
                                <Th width="50px">Select</Th>
                                <Th width="150px">Name</Th>
                                <Th width="150px">Email</Th>
                                <Th width="100px">Role</Th>
                                <Th width="110px" textAlign={"center"}>Action</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {currentItems.map((member) => (
                                <Tr
                                    key={member.id}
                                    className={selectedRows.includes(member.id) ? 'selected-row' : ''}
                                >
                                    <Td width="50px" borderBottom="1px solid #ccc">
                                        <label className="checkbox-container">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(member.id)}
                                                onChange={() => handleCheckboxChange(member.id)}
                                            />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Td>
                                    <Td width="150px" borderBottom="1px solid #ccc">
                                        {editMode === member.id ? (
                                            <Input
                                                value={editedData[member.id]?.name || member.name}
                                                onChange={(e) => handleEditInputChange(e, member.id, 'name')}
                                            />
                                        ) : (
                                            member.name
                                        )}
                                    </Td>
                                    <Td width="150px" borderBottom="1px solid #ccc">
                                        {editMode === member.id ? (
                                            <Input
                                                value={editedData[member.id]?.email || member.email}
                                                onChange={(e) => handleEditInputChange(e, member.id, 'email')}
                                            />
                                        ) : (
                                            member.email
                                        )}
                                    </Td>
                                    <Td width="100px" borderBottom="1px solid #ccc">
                                        {editMode === member.id ? (
                                            <Input
                                                value={editedData[member.id]?.role || member.role}
                                                onChange={(e) => handleEditInputChange(e, member.id, 'role')}
                                            />
                                        ) : (
                                            member.role
                                        )}
                                    </Td>
                                    <Td width="100px" borderBottom="1px solid #ccc">
                                        <Flex justify="space-around" pr="1">
                                            {editMode === member.id ? (
                                                <>
                                                    <Button
                                                        colorScheme="teal"
                                                        color="#fff"
                                                        size="xs"
                                                        onClick={() => handleSave(member.id)}
                                                    >
                                                        <MdSave />
                                                    </Button>
                                                    <Button
                                                        colorScheme="red"
                                                        color="#fff"
                                                        size="xs"
                                                        onClick={() => handleCancelEdit(member.id)}
                                                    >
                                                        <MdClose />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Flex justify="space-around" pr="1">
                                                    <Button
                                                        colorScheme="red"
                                                        ml={"1"}
                                                        mr={"1"}
                                                        color="#fff"
                                                        size="xs"
                                                        onClick={() => handleDelete(member.id)}
                                                    >
                                                        <MdDelete />
                                                    </Button>
                                                    <Button
                                                        ml={"1"}
                                                        mr={"1"}
                                                        colorScheme="teal"
                                                        color="#fff"
                                                        size="xs"
                                                        onClick={() => handleEdit(member.id)}
                                                    >
                                                        <MdEdit />
                                                    </Button>
                                                </Flex>
                                            )}
                                        </Flex>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>

                <Flex justify="flex-end" align="center" position="absolute" bottom="0" right="0" p={4}>
                    <Box p={4} color="#777" fontWeight="bold" justify="flex-start">
                        Page {currentPage} of {totalPages}
                    </Box>
                    <Box p={4} color="#777" fontWeight="bold" justify="flex-start">
                        {selectedRows.length} row(s) selected.
                    </Box>
                    <Tooltip hasArrow label='Go to first page' bg='#ccc'>
                        <Button
                            onClick={handleFirstPage}
                            m={1}
                            leftIcon={<MdArrowLeft />}
                            bg="#fff"
                            color="#333"
                            border="1px solid #ccc"
                            size="xs"
                        />
                    </Tooltip>
                    <Tooltip hasArrow label='Go to previous page' bg='#ccc'>
                        <Button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            m={1}
                            leftIcon={<FaArrowLeft />}
                            bg="#fff"
                            color="#333"
                            size="xs"
                            border="1px solid #ccc"
                        />
                    </Tooltip>
                    {[currentPage - 1, currentPage, currentPage + 1].map((page) => (
                        <Box
                            m={1}
                            px={3}
                            border="1px solid #ccc"
                            borderRadius="md"
                            bg={page === currentPage ? '#ccc' : '#fff'}
                            color={page === currentPage ? '#333' : '#333'}
                            fontWeight="bold"
                            cursor="pointer"
                            // onClick={page === currentPage - 1 ? { handlePrevPage } : { handleNextPage }}
                            // onClick={currentPage}
                            variant={page === currentPage ? 'solid' : 'outline'}
                        >
                            {page}
                        </Box>

                    ))}
                    <Tooltip hasArrow label='Go to next page' bg='#ccc'>
                        <Button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            m={1}
                            rightIcon={<FaArrowRight />}
                            bg="#fff"
                            border="1px solid #ccc"
                            color="#333"
                            size="xs"
                        />
                    </Tooltip>
                    <Tooltip hasArrow label='Go to last page' bg='#ccc'>
                        <Button
                            onClick={handleLastPage}
                            m={1}
                            rightIcon={<MdArrowRight />}
                            bg="#fff"
                            border="1px solid #ccc"
                            color="#333"
                            size="xs"
                        />
                    </Tooltip>
                </Flex>
            </div>

            <CustomAlert isOpen={showAlert} onClose={() => setShowAlert(false)} message={alertMessage} />
        </>
    );
};

export default Dashboard;
